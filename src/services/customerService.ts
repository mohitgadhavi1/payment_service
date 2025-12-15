import { db } from '../config/firebase';
import { stripe } from '../config/stripe';
import { Customer, CreateCustomerRequest } from '../types';

export class CustomerService {
    private collection = db.collection('customers');

    async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
        // Create customer in Stripe
        const stripeCustomer = await stripe.customers.create({
            email: data.email,
            name: data.name,
            phone: data.phone,
        });

        // Create customer in Firestore
        const customer: Omit<Customer, 'id'> = {
            email: data.email,
            name: data.name,
            phone: data.phone,
            stripeCustomerId: stripeCustomer.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const docRef = await this.collection.add(customer);

        return {
            id: docRef.id,
            ...customer,
        };
    }

    async getCustomer(id: string): Promise<Customer | null> {
        const doc = await this.collection.doc(id).get();

        if (!doc.exists) {
            return null;
        }

        return {
            id: doc.id,
            ...doc.data(),
        } as Customer;
    }

    async getCustomerByEmail(email: string): Promise<Customer | null> {
        const snapshot = await this.collection.where('email', '==', email).limit(1).get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data(),
        } as Customer;
    }

    async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
        const updateData = {
            ...updates,
            updatedAt: new Date(),
        };

        await this.collection.doc(id).update(updateData);

        const updatedCustomer = await this.getCustomer(id);
        if (!updatedCustomer) {
            throw new Error('Customer not found after update');
        }

        return updatedCustomer;
    }

    async deleteCustomer(id: string): Promise<void> {
        const customer = await this.getCustomer(id);
        if (!customer) {
            throw new Error('Customer not found');
        }

        // Delete from Stripe
        if (customer.stripeCustomerId) {
            await stripe.customers.del(customer.stripeCustomerId);
        }

        // Delete from Firestore
        await this.collection.doc(id).delete();
    }
}