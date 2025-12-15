# Payment Microservice

A complete payment processing microservice built with Express.js, TypeScript, Firestore, and Stripe.

## Features

- 💳 **Payment Processing**: Create, confirm, and cancel payment intents
- 👥 **Customer Management**: Full CRUD operations for customers
- 🔄 **Webhook Handling**: Real-time payment status updates via Stripe webhooks
- 🔒 **Security**: Rate limiting, CORS, helmet, input validation
- 📊 **Database**: Firestore for data persistence
- 🎯 **TypeScript**: Full type safety and IntelliSense support
- 📚 **API Documentation**: Built-in API documentation endpoint

## Quick Start

### Prerequisites

- Node.js 18+
- Firebase project with Firestore enabled
- Stripe account

### Installation

1. Clone and install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Build and start:

```bash
npm run build
npm start
```

For development:

```bash
npm run dev
```

## Environment Variables

```env
PORT=3000
NODE_ENV=development

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project-id.iam.gserviceaccount.com

# API Configuration
API_BASE_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

## API Endpoints

### Health Check

- `GET /health` - Service health status

### Documentation

- `GET /api/docs` - API documentation

### Payments

- `POST /api/payments` - Create payment intent
- `GET /api/payments/:id` - Get payment intent
- `POST /api/payments/:id/confirm` - Confirm payment
- `POST /api/payments/:id/cancel` - Cancel payment
- `GET /api/payments/customer/:customerId` - Get customer payments

### Customers

- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer
- `GET /api/customers/email/:email` - Get customer by email
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Webhooks

- `POST /api/webhooks/stripe` - Stripe webhook endpoint

## Usage Examples

### Create a Customer

```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "name": "John Doe",
    "phone": "+1234567890"
  }'
```

### Create a Payment Intent

```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 29.99,
    "currency": "usd",
    "customerId": "customer_id_here",
    "metadata": {
      "orderId": "order_123"
    }
  }'
```

### Confirm Payment

```bash
curl -X POST http://localhost:3000/api/payments/{payment_id}/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethodId": "pm_card_visa"
  }'
```

## Webhook Setup

1. In your Stripe dashboard, create a webhook endpoint pointing to:

   ```
   https://your-domain.com/api/webhooks/stripe
   ```

2. Select these events:

   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`

3. Copy the webhook signing secret to your `.env` file

## Firebase Setup

1. Create a Firebase project
2. Enable Firestore Database
3. Create a service account:
   - Go to Project Settings > Service Accounts
   - Generate new private key
   - Add the credentials to your `.env` file

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Input Validation**: Joi schema validation
- **Error Handling**: Comprehensive error handling and logging

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a process manager like PM2
3. Set up proper logging
4. Configure reverse proxy (nginx)
5. Use HTTPS
6. Set up monitoring

## License

MIT
