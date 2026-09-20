import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Zod Validation Schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  avatarUrl: z.string().optional(),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

export const createGroupSchema = z.object({
  name: z.string().min(2, 'Group name must be at least 2 characters'),
  description: z.string().optional(),
  type: z.enum(['trip', 'flat', 'event', 'other']).optional(),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional(),
});

export const createExpenseSchema = z.object({
  amount: z.number().positive('Expense amount must be positive'),
  category: z.enum(['Food', 'Travel', 'Housing', 'Entertainment', 'Shopping', 'Utilities', 'Other']).optional(),
  description: z.string().min(1, 'Description is required'),
  splitType: z.enum(['equal', 'exact', 'percent', 'shares']).optional(),
  paidBy: z.string().optional(),
  customSplits: z.array(z.object({ userId: z.string(), amount: z.number() })).optional(),
  receiptUrl: z.string().optional(),
});

export const createSettlementSchema = z.object({
  toUserId: z.string().min(1, 'Recipient user ID is required'),
  amount: z.number().positive('Settlement amount must be positive'),
  enableRoundUp: z.boolean().optional(),
  fromUserId: z.string().optional(),
});

// Middleware Factory for Zod Schemas
export function validateRequestBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((e: any) => e.message).join(', ');
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: `Validation failed: ${issues}`,
          },
        });
      }
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid request payload',
        },
      });
    }
  };
}
