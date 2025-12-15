import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import paymentRoutes from './routes/payments';
import customerRoutes from './routes/customers';
import webhookRoutes from './routes/webhooks';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing middleware
// Raw body for webhooks (Stripe requires raw body for signature verification)
app.use('/api/webhooks', express.raw({ type: 'application/json' }));
// JSON body for other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// API routes
app.use('/api/payments', paymentRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/webhooks', webhookRoutes);

// API documentation endpoint
app.get('/api/docs', (req, res) => {
    res.json({
        title: 'Payment Microservice API',
        version: '1.0.0',
        description: 'Complete payment processing API with Stripe and Firestore',
        baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
        endpoints: {
            payments: {
                'POST /api/payments': 'Create payment intent',
                'GET /api/payments/:id': 'Get payment intent',
                'POST /api/payments/:id/confirm': 'Confirm payment intent',
                'POST /api/payments/:id/cancel': 'Cancel payment intent',
                'GET /api/payments/customer/:customerId': 'Get payments by customer',
            },
            customers: {
                'POST /api/customers': 'Create customer',
                'GET /api/customers/:id': 'Get customer',
                'GET /api/customers/email/:email': 'Get customer by email',
                'PUT /api/customers/:id': 'Update customer',
                'DELETE /api/customers/:id': 'Delete customer',
            },
            webhooks: {
                'POST /api/webhooks/stripe': 'Stripe webhook endpoint',
            },
            health: {
                'GET /health': 'Health check',
            },
        },
    });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;