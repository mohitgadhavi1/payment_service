import { Router } from 'express';
import { CustomerService } from '../services/customerService';
import { validateCreateCustomer } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const customerService = new CustomerService();

// Create customer
router.post('/', validateCreateCustomer, asyncHandler(async (req, res) => {
    const customer = await customerService.createCustomer(req.body);

    res.status(201).json({
        success: true,
        data: customer,
    });
}));

// Get customer
router.get('/:id', asyncHandler(async (req, res) => {
    const customer = await customerService.getCustomer(req.params.id);

    if (!customer) {
        return res.status(404).json({
            success: false,
            error: 'Customer not found',
        });
    }

    res.json({
        success: true,
        data: customer,
    });
}));

// Get customer by email
router.get('/email/:email', asyncHandler(async (req, res) => {
    const customer = await customerService.getCustomerByEmail(req.params.email);

    if (!customer) {
        return res.status(404).json({
            success: false,
            error: 'Customer not found',
        });
    }

    res.json({
        success: true,
        data: customer,
    });
}));

// Update customer
router.put('/:id', asyncHandler(async (req, res) => {
    const customer = await customerService.updateCustomer(req.params.id, req.body);

    res.json({
        success: true,
        data: customer,
    });
}));

// Delete customer
router.delete('/:id', asyncHandler(async (req, res) => {
    await customerService.deleteCustomer(req.params.id);

    res.json({
        success: true,
        message: 'Customer deleted successfully',
    });
}));

export default router;