import { db } from '../config/firebase';
import { stripe } from '../config/stripe';
import { PaymentIntent, CreatePaymentIntentRequest } from '../types';
import { CustomerService } from './customerService';

export class PaymentService {
    private collection = db.collection('payments');
    private customerService = new CustomerService();

    async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentIntent> {
        let stripeCustomerId: string | undefined;

        // Get or validate customer
        if (data.customerId) {
            const customer = await this.customerService.getCustomer(data.customerId);
            if (!customer) {
                throw new Error('Customer not found');
            }
            stripeCustomerId = customer.stripeCustomerId;
        }

        // Create payment intent in Stripe
        const stripePaymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(data.amount * 100), // Convert to cents
            currency: data.currency.toLowerCase(),
            customer: stripeCustomerId,
            payment_method: data.paymentMethodId,
            metadata: data.metadata || {},
            automatic_payment_methods: {
                enabled: true,
            },
        });

        // Store payment intent in Firestore
        const paymentIntent: Omit<PaymentIntent, 'id'> = {
            amount: data.amount,
            currency: data.currency,
            status: 'pending',
            customerId: data.customerId,
            metadata: {
                ...data.metadata,
                stripePaymentIntentId: stripePaymentIntent.id,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const docRef = await this.collection.add(paymentIntent);

        return {
            id: docRef.id,
            ...paymentIntent,
        };
    }

    async getPaymentIntent(id: string): Promise<PaymentIntent | null> {
        const doc = await this.collection.doc(id).get();

        if (!doc.exists) {
            return null;
        }

        return {
            id: doc.id,
            ...doc.data(),
        } as PaymentIntent;
    }

    async confirmPaymentIntent(id: string, paymentMethodId?: string): Promise<PaymentIntent> {
        const payment = await this.getPaymentIntent(id);
        if (!payment) {
            throw new Error('Payment intent not found');
        }

        const stripePaymentIntentId = payment.metadata?.stripePaymentIntentId;
        if (!stripePaymentIntentId) {
            throw new Error('Stripe payment intent ID not found');
        }

        // Confirm payment in Stripe
        const confirmedIntent = await stripe.paymentIntents.confirm(stripePaymentIntentId, {
            payment_method: paymentMethodId,
        });

        // Update status in Firestore
        const updatedPayment = await this.updatePaymentStatus(
            id,
            confirmedIntent.status as PaymentIntent['status']
        );

        return updatedPayment;
    }

    async updatePaymentStatus(id: string, status: PaymentIntent['status']): Promise<PaymentIntent> {
        await this.collection.doc(id).update({
            status,
            updatedAt: new Date(),
        });

        const updatedPayment = await this.getPaymentIntent(id);
        if (!updatedPayment) {
            throw new Error('Payment not found after update');
        }

        return updatedPayment;
    }

    async getPaymentsByCustomer(customerId: string): Promise<PaymentIntent[]> {
        const snapshot = await this.collection
            .where('customerId', '==', customerId)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as PaymentIntent[];
    }

    async cancelPaymentIntent(id: string): Promise<PaymentIntent> {
        const payment = await this.getPaymentIntent(id);
        if (!payment) {
            throw new Error('Payment intent not found');
        }

        const stripePaymentIntentId = payment.metadata?.stripePaymentIntentId;
        if (stripePaymentIntentId) {
            await stripe.paymentIntents.cancel(stripePaymentIntentId);
        }

        return await this.updatePaymentStatus(id, 'canceled');
    }
}