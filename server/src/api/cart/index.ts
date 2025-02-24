import { Router } from 'express';
import { CartController } from '../../controllers/cart';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { cartValidation } from '../../lib/validation/cart.schemas';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

/**
 * @route GET /api/cart
 * @desc Get user's cart
 * @access Private
 */
router.get(
  '/',
  CartController.getCart
);

/**
 * @route POST /api/cart/items
 * @desc Add item to cart
 * @access Private
 */
router.post(
  '/items',
  validate({
    body: cartValidation.addItem
  }),
  CartController.addItem
);

/**
 * @route PUT /api/cart/items/:id
 * @desc Update cart item quantity
 * @access Private
 */
router.put(
  '/items/:id',
  validate({
    params: cartValidation.itemId,
    body: cartValidation.updateItem
  }),
  CartController.updateItem
);

/**
 * @route DELETE /api/cart/items/:id
 * @desc Remove item from cart
 * @access Private
 */
router.delete(
  '/items/:id',
  validate({
    params: cartValidation.itemId
  }),
  CartController.removeItem
);

/**
 * @route POST /api/cart/clear
 * @desc Clear entire cart
 * @access Private
 */
router.post(
  '/clear',
  CartController.clearCart
);

/**
 * @route GET /api/cart/summary
 * @desc Get cart summary with pricing details
 * @access Private
 */
router.get(
  '/summary',
  CartController.getCartSummary
);

/**
 * @route POST /api/cart/checkout
 * @desc Process cart checkout
 * @access Private
 */
router.post(
  '/checkout',
  validate({
    body: cartValidation.checkout
  }),
  CartController.checkout
);

/**
 * @route POST /api/cart/apply-coupon
 * @desc Apply coupon to cart
 * @access Private
 */
router.post(
  '/apply-coupon',
  validate({
    body: cartValidation.applyCoupon
  }),
  CartController.applyCoupon
);

/**
 * @route DELETE /api/cart/remove-coupon
 * @desc Remove applied coupon
 * @access Private
 */
router.delete(
  '/remove-coupon',
  CartController.removeCoupon
);

/**
 * @route PUT /api/cart/shipping
 * @desc Update shipping address
 * @access Private
 */
router.put(
  '/shipping',
  validate({
    body: cartValidation.updateShipping
  }),
  CartController.updateShipping
);

/**
 * @route GET /api/cart/shipping-methods
 * @desc Get available shipping methods
 * @access Private
 */
router.get(
  '/shipping-methods',
  CartController.getShippingMethods
);

/**
 * @route PUT /api/cart/shipping-method
 * @desc Update shipping method
 * @access Private
 */
router.put(
  '/shipping-method',
  validate({
    body: cartValidation.updateShippingMethod
  }),
  CartController.updateShippingMethod
);

/**
 * @route GET /api/cart/payment-methods
 * @desc Get available payment methods
 * @access Private
 */
router.get(
  '/payment-methods',
  CartController.getPaymentMethods
);

export default router;