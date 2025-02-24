import { z } from 'zod';
import { CART_CONFIG } from '../../types/cart';
import { stringValidations } from './common.schemas';

export const cartValidation = {
  // Item operations
  addItem: z.object({
    productId: z.string().uuid('Invalid product ID'),
    quantity: z.number()
      .int('Quantity must be a whole number')
      .min(CART_CONFIG.minQuantity, `Minimum quantity is ${CART_CONFIG.minQuantity}`)
      .max(CART_CONFIG.maxQuantity, `Maximum quantity is ${CART_CONFIG.maxQuantity}`)
  }),

  updateItem: z.object({
    quantity: z.number()
      .int('Quantity must be a whole number')
      .min(CART_CONFIG.minQuantity, `Minimum quantity is ${CART_CONFIG.minQuantity}`)
      .max(CART_CONFIG.maxQuantity, `Maximum quantity is ${CART_CONFIG.maxQuantity}`)
  }),

  itemId: z.object({
    id: z.string().uuid('Invalid item ID')
  }),

  // Checkout
  checkout: z.object({
    shippingAddress: z.string()
      .min(10, 'Shipping address must be at least 10 characters')
      .max(500, 'Shipping address too long'),
    paymentMethod: z.string().uuid('Invalid payment method'),
    shippingMethod: z.string().uuid('Invalid shipping method'),
    notes: z.string().max(500, 'Notes too long').optional()
  }),

  // Coupon operations
  applyCoupon: z.object({
    code: z.string()
      .min(3, 'Invalid coupon code')
      .max(20, 'Invalid coupon code')
      .toUpperCase()
  }),

  // Shipping operations
  updateShipping: z.object({
    address: z.string()
      .min(10, 'Shipping address must be at least 10 characters')
      .max(500, 'Shipping address too long'),
    name: stringValidations.name,
    phone: stringValidations.phone,
    city: z.string().min(2, 'Invalid city'),
    state: z.string().min(2, 'Invalid state'),
    country: z.string().length(2, 'Invalid country code'),
    postalCode: z.string().min(4, 'Invalid postal code').max(10)
  }),

  updateShippingMethod: z.object({
    methodId: z.string().uuid('Invalid shipping method')
  })
};

// Export validation types
export type AddItemInput = z.infer<typeof cartValidation.addItem>;
export type UpdateItemInput = z.infer<typeof cartValidation.updateItem>;
export type CheckoutInput = z.infer<typeof cartValidation.checkout>;
export type ShippingInput = z.infer<typeof cartValidation.updateShipping>;

// Utility functions for cart validation
export function validateQuantity(quantity: number): boolean {
  return (
    Number.isInteger(quantity) &&
    quantity >= CART_CONFIG.minQuantity &&
    quantity <= CART_CONFIG.maxQuantity
  );
}

export function validateCouponCode(code: string): boolean {
  return /^[A-Z0-9]{3,20}$/.test(code);
}

export function validateShippingAddress(address: string): boolean {
  return address.length >= 10 && address.length <= 500;
}

export function validatePostalCode(code: string): boolean {
  return /^[A-Z0-9]{4,10}$/i.test(code);
}

// Custom error messages
export const CartValidationErrors = {
  INVALID_QUANTITY: (min: number, max: number) => 
    `Quantity must be between ${min} and ${max}`,
  INVALID_COUPON: 'Invalid coupon code format',
  INVALID_ADDRESS: 'Invalid shipping address',
  INVALID_POSTAL_CODE: 'Invalid postal code format',
  INVALID_PHONE: 'Invalid phone number format',
  MISSING_SHIPPING: 'Shipping information is required',
  MISSING_PAYMENT: 'Payment method is required'
} as const;