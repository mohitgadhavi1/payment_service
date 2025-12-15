import { db } from '../config/firebase';
import { stripe, STRIPE_CONFIG } from '../config/stripe';
import { WebhookEvent } from '../types';
import { PaymentService } from './paymentService';

export class WebhookService {
    private collection = db.collection('webhook_events');
    private paymentService = new PaymentService();

    async processStripeWebhook(body: string, signature: string): Promise<void> {
        if (!STRIPE_CONFIG.webhookSecret) {
            throw new Error('Webhook secret not configured');
        }

        let event: any;

        try {
            event = stripe.webhooks.constructEvent(body, signature, STRIPE_CONFIG.webhookSecret);
        } catch (err) {
            throw new Error(`Webhook signature verification failed: ${err}`);
        }

        // Store webhook event
        await this.storeWebhookEvent(event);

        // Process the event
        await this.handleWebhookEvent(event);
    }

    private async storeWebhookEvent(event: any): Promise<void> {
        const webhookEvent: Omit<WebhookEvent, 'id'> = {
            type: event.type,
            data: event.data,
            createdAt: new Date(),
        };

        await this.collection.doc(event.id).set(webhookEvent);
    }

    private async handleWebhookEvent(event: any): Promise<void> {
        switch (event.type) {
            case 'payment_intent.succeeded':
                await this.handlePaymentSucceeded(event.data.object);
                break;

            case 'payment_intent.payment_failed':
                await this.handlePaymentFailed(event.data.object);
                break;

            case 'payment_intent.canceled':
                await this.handlePaymentCanceled(event.data.object);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        // Mark event as processed
        await this.collection.doc(event.id).update({
            processedAt: new Date(),
        });
    }

    private async handlePaymentSucceeded(paymentIntent: any): Promise<void> {
        // Find payment in our database by Stripe payment intent ID
        const snapshot = await db.collection('payments')
            .where('metadata.stripePaymentIntentId', '==', paymentIntent.id)
            .limit(1)
            .get();

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            await this.paymentService.updatePaymentStatus(doc.id, 'succeeded');
        }
    }

    private async handlePaymentFailed(paymentIntent: any): Promise<void> {
        const snapshot = await db.collection('payments')
            .where('metadata.stripePaymentIntentId', '==', paymentIntent.id)
            .limit(1)
            .get();

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            await this.paymentService.updatePaymentStatus(doc.id, 'failed');
        }
    }

    private async handlePaymentCanceled(paymentIntent: any): Promise<void> {
        const snapshot = await db.collection('payments')
            .where('metadata.stripePaymentIntentId', '==', paymentIntent.id)
            .limit(1)
            .get();

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            await this.paymentService.updatePaymentStatus(doc.id, 'canceled');
        }
    }
}