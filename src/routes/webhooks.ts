import { Router } from 'express';
import { WebhookService } from '../services/webhookService';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const webhookService = new WebhookService();

// Stripe webhook endpoint
router.post('/stripe', asyncHandler(async (req, res) => {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
        return res.status(400).json({
            error: 'Missing stripe-signature header',
        });
    }

    await webhookService.processStripeWebhook(req.body, signature);

    res.json({ received: true });
}));

export default router;