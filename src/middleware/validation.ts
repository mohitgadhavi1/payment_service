import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateCreatePayment = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        amount: Joi.number().positive().required(),
        currency: Joi.string().length(3).required(),
        customerId: Joi.string().optional(),
        paymentMethodId: Joi.string().optional(),
        metadata: Joi.object().optional(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            error: 'Validation failed',
            details: error.details[0].message,
        });
    }

    next();
};

export const validateCreateCustomer = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        name: Joi.string().optional(),
        phone: Joi.string().optional(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            error: 'Validation failed',
            details: error.details[0].message,
        });
    }

    next();
};

export const validateConfirmPayment = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        paymentMethodId: Joi.string().optional(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            error: 'Validation failed',
            details: error.details[0].message,
        });
    }

    next();
};