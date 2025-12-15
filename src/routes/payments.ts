import { Router } from 'express';
import { PaymentService } from '../services/paymentService';
import { validateCreatePayment, validateConfirmPayment } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const paymentService = new PaymentService();

// Create payment intent
router.post('/', validateCreatePayment, asyncHandler(async (req, res) => {
    const payment = await paymentService.createPaymentIntent(req.body);

    res.status(201).json({
        success: true,
        data: payment,
    });
}));

// Get payment intent
router.get('/:id', asyncHandler(async (req, res) => {
    const payment = await paymentService.getPaymentIntent(req.params.id);

    if (!payment) {
        return res.status(404).json({
            success: false,
            error: 'Payment not found',
        });
    }

    res.json({
        success: true,
        data: payment,
    });
}));

// Confirm payment intent
router.post('/:id/confirm', validateConfirmPayment, asyncHandler(async (req, res) => {
    const payment = await paymentService.confirmPaymentIntent(
        req.params.id,
        req.body.paymentMethodId
    );

    res.json({
        success: true,
        data: payment,
    });
}));

// Cancel payment intent
router.post('/:id/cancel', asyncHandler(async (req, res) => {
    const payment = await paymentService.cancelPaymentIntent(req.params.id);

    res.json({
        success: true,
        data: payment,
    });
}));

// Get payments by customer
router.get('/customer/:customerId', asyncHandler(async (req, res) => {
    const payments = await paymentService.getPaymentsByCustomer(req.params.customerId);

    res.json({
        success: true,
        data: payments,
    });
}));

export default router;