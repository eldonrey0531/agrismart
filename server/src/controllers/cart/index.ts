import { Request } from 'express';
import { CartService } from '../../services/cart.service';
import { ResponseHandler } from '../../utils/response-handler';
import { throwError } from '../../lib/errors';
import { TypedRequest, TypedResponse } from '../../types/express-extension';
import { CartItem, CartSummary, ShippingMethod, PaymentMethod } from '../../types/cart';

export class CartController {
  static async getCart(req: Request, res: TypedResponse<CartItem[]>) {
    try {
      const cart = await CartService.getCart(req.user!.id);
      ResponseHandler.success(res, cart);
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async addItem(
    req: TypedRequest<{ productId: string; quantity: number }>,
    res: TypedResponse<CartItem>
  ) {
    try {
      const item = await CartService.addItem(req.user!.id, req.body);
      ResponseHandler.created(res, item);
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async updateItem(
    req: TypedRequest<{ quantity: number }, any, { id: string }>,
    res: TypedResponse<CartItem>
  ) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const item = await CartService.updateItem(req.user!.id, id, quantity);
      ResponseHandler.success(res, item);
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async removeItem(
    req: TypedRequest<any, any, { id: string }>,
    res: TypedResponse
  ) {
    try {
      const { id } = req.params;
      await CartService.removeItem(req.user!.id, id);
      ResponseHandler.success(res, null, 'Item removed successfully');
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async clearCart(req: Request, res: TypedResponse) {
    try {
      await CartService.clearCart(req.user!.id);
      ResponseHandler.success(res, null, 'Cart cleared successfully');
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async getCartSummary(req: Request, res: TypedResponse<CartSummary>) {
    try {
      const summary = await CartService.getCartSummary(req.user!.id);
      ResponseHandler.success(res, summary);
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async checkout(
    req: TypedRequest<{
      shippingAddress: string;
      paymentMethod: string;
      shippingMethod: string;
    }>,
    res: TypedResponse
  ) {
    try {
      const order = await CartService.checkout(req.user!.id, req.body);
      ResponseHandler.success(res, order, 'Order placed successfully');
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async applyCoupon(
    req: TypedRequest<{ code: string }>,
    res: TypedResponse
  ) {
    try {
      const discount = await CartService.applyCoupon(req.user!.id, req.body.code);
      ResponseHandler.success(res, discount, 'Coupon applied successfully');
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async removeCoupon(req: Request, res: TypedResponse) {
    try {
      await CartService.removeCoupon(req.user!.id);
      ResponseHandler.success(res, null, 'Coupon removed successfully');
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async updateShipping(
    req: TypedRequest<{ address: string }>,
    res: TypedResponse
  ) {
    try {
      const cart = await CartService.updateShipping(req.user!.id, req.body.address);
      ResponseHandler.success(res, cart);
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async getShippingMethods(
    req: Request,
    res: TypedResponse<ShippingMethod[]>
  ) {
    try {
      const methods = await CartService.getShippingMethods(req.user!.id);
      ResponseHandler.success(res, methods);
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async updateShippingMethod(
    req: TypedRequest<{ methodId: string }>,
    res: TypedResponse
  ) {
    try {
      const cart = await CartService.updateShippingMethod(
        req.user!.id,
        req.body.methodId
      );
      ResponseHandler.success(res, cart);
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async getPaymentMethods(
    req: Request,
    res: TypedResponse<PaymentMethod[]>
  ) {
    try {
      const methods = await CartService.getPaymentMethods();
      ResponseHandler.success(res, methods);
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }
}