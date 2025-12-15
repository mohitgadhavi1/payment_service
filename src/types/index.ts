export interface PaymentIntent {
    id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'succeeded' | 'failed' | 'canceled';
    customerId?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface Customer {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    stripeCustomerId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaymentMethod {
    id: string;
    customerId: string;
    type: 'card' | 'bank_account';
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault: boolean;
    stripePaymentMethodId: string;
    createdAt: Date;
}

export interface CreatePaymentIntentRequest {
    amount: number;
    currency: string;
    customerId?: string;
    paymentMethodId?: string;
    metadata?: Record<string, any>;
}

export interface CreateCustomerRequest {
    email: string;
    name?: string;
    phone?: string;
}

export interface WebhookEvent {
    id: string;
    type: string;
    data: any;
    processedAt?: Date;
    createdAt: Date;
}