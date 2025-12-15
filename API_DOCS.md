# Payment Microservice API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, the API doesn't require authentication. In production, implement JWT or API key authentication.

## Response Format

All API responses follow this format:

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

## Endpoints

### Health Check

#### GET /health

Check service health status.

**Response:**

```json
{
  "status": "OK",
  "timestamp": "2023-12-15T10:30:00.000Z",
  "uptime": 3600
}
```

---

## Customers

### POST /api/customers

Create a new customer.

**Request Body:**

```json
{
  "email": "customer@example.com",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "customer_123",
    "email": "customer@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "stripeCustomerId": "cus_stripe123",
    "createdAt": "2023-12-15T10:30:00.000Z",
    "updatedAt": "2023-12-15T10:30:00.000Z"
  }
}
```

### GET /api/customers/:id

Get customer by ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "customer_123",
    "email": "customer@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "stripeCustomerId": "cus_stripe123",
    "createdAt": "2023-12-15T10:30:00.000Z",
    "updatedAt": "2023-12-15T10:30:00.000Z"
  }
}
```

### GET /api/customers/email/:email

Get customer by email address.

**Response:** Same as GET /api/customers/:id

### PUT /api/customers/:id

Update customer information.

**Request Body:**

```json
{
  "name": "Jane Doe",
  "phone": "+0987654321"
}
```

**Response:** Updated customer object

### DELETE /api/customers/:id

Delete a customer.

**Response:**

```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

---

## Payments

### POST /api/payments

Create a new payment intent.

**Request Body:**

```json
{
  "amount": 29.99,
  "currency": "usd",
  "customerId": "customer_123",
  "paymentMethodId": "pm_card_visa",
  "metadata": {
    "orderId": "order_123",
    "productId": "prod_456"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "payment_123",
    "amount": 29.99,
    "currency": "usd",
    "status": "pending",
    "customerId": "customer_123",
    "metadata": {
      "orderId": "order_123",
      "productId": "prod_456",
      "stripePaymentIntentId": "pi_stripe123"
    },
    "createdAt": "2023-12-15T10:30:00.000Z",
    "updatedAt": "2023-12-15T10:30:00.000Z"
  }
}
```

### GET /api/payments/:id

Get payment intent by ID.

**Response:** Payment intent object

### POST /api/payments/:id/confirm

Confirm a payment intent.

**Request Body:**

```json
{
  "paymentMethodId": "pm_card_visa"
}
```

**Response:** Updated payment intent object with confirmed status

### POST /api/payments/:id/cancel

Cancel a payment intent.

**Response:** Updated payment intent object with canceled status

### GET /api/payments/customer/:customerId

Get all payments for a specific customer.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "payment_123",
      "amount": 29.99,
      "currency": "usd",
      "status": "succeeded",
      "customerId": "customer_123",
      "metadata": { ... },
      "createdAt": "2023-12-15T10:30:00.000Z",
      "updatedAt": "2023-12-15T10:30:00.000Z"
    }
  ]
}
```

---

## Webhooks

### POST /api/webhooks/stripe

Stripe webhook endpoint for real-time payment updates.

**Headers:**

- `stripe-signature`: Stripe webhook signature for verification

**Supported Events:**

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`

**Response:**

```json
{
  "received": true
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Error Codes

### Validation Errors

```json
{
  "error": "Validation failed",
  "details": "\"amount\" must be a positive number"
}
```

### Not Found Errors

```json
{
  "success": false,
  "error": "Customer not found"
}
```

### Rate Limiting

```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

## Payment Status Flow

1. **pending** - Payment intent created
2. **succeeded** - Payment completed successfully
3. **failed** - Payment failed
4. **canceled** - Payment was canceled

## Currency Codes

Supported currencies (ISO 4217):

- `usd` - US Dollar
- `eur` - Euro
- `gbp` - British Pound
- `inr` - Indian Rupee
- And all other Stripe-supported currencies

## Rate Limits

- **General API**: 100 requests per 15 minutes per IP
- **Webhooks**: No rate limiting (handled by Stripe)

## Testing

### Test Card Numbers (Stripe)

- **Visa**: 4242424242424242
- **Visa (debit)**: 4000056655665556
- **Mastercard**: 5555555555554444
- **American Express**: 378282246310005
- **Declined**: 4000000000000002

### Test Webhook Events

Use Stripe CLI to forward webhook events to your local development server:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## SDK Examples

### JavaScript/Node.js

```javascript
const axios = require("axios");

// Create customer
const customer = await axios.post("http://localhost:3000/api/customers", {
  email: "test@example.com",
  name: "Test User",
});

// Create payment
const payment = await axios.post("http://localhost:3000/api/payments", {
  amount: 29.99,
  currency: "usd",
  customerId: customer.data.data.id,
});

// Confirm payment
const confirmed = await axios.post(
  `http://localhost:3000/api/payments/${payment.data.data.id}/confirm`,
  { paymentMethodId: "pm_card_visa" }
);
```

### Python

```python
import requests

# Create customer
customer_response = requests.post('http://localhost:3000/api/customers', json={
    'email': 'test@example.com',
    'name': 'Test User'
})
customer = customer_response.json()['data']

# Create payment
payment_response = requests.post('http://localhost:3000/api/payments', json={
    'amount': 29.99,
    'currency': 'usd',
    'customerId': customer['id']
})
payment = payment_response.json()['data']

# Confirm payment
confirm_response = requests.post(
    f'http://localhost:3000/api/payments/{payment["id"]}/confirm',
    json={'paymentMethodId': 'pm_card_visa'}
)
```

### cURL

```bash
# Create customer
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'

# Create payment
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{"amount":29.99,"currency":"usd","customerId":"customer_id"}'

# Confirm payment
curl -X POST http://localhost:3000/api/payments/payment_id/confirm \
  -H "Content-Type: application/json" \
  -d '{"paymentMethodId":"pm_card_visa"}'
```
