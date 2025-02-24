import { Product } from '@prisma/client';
import { DeepPartial } from './index';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
  product: {
    id: string;
    title: string;
    price: number;
    stock: number;
    image?: string;
  };
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount?: number;
  total: number;
  itemCount: number;
  shipping_address?: string;
  shipping_method?: ShippingMethod;
  payment_method?: PaymentMethod;
  coupon?: {
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
  };
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimated_days: number;
  is_available: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'cash' | 'bank_transfer';
  provider?: string;
  is_active: boolean;
  requires_confirmation: boolean;
}

export interface AddToCartInput {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}

export interface CheckoutInput {
  shippingAddress: string;
  paymentMethod: string;
  shippingMethod: string;
}

export interface ApplyCouponInput {
  code: string;
}

export interface UpdateShippingInput {
  address: string;
}

export interface CartError extends Error {
  code: CartErrorCode;
  details?: Record<string, any>;
}

export enum CartErrorCode {
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  INVALID_QUANTITY = 'INVALID_QUANTITY',
  CART_EMPTY = 'CART_EMPTY',
  INVALID_COUPON = 'INVALID_COUPON',
  COUPON_EXPIRED = 'COUPON_EXPIRED',
  SHIPPING_REQUIRED = 'SHIPPING_REQUIRED',
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  CHECKOUT_FAILED = 'CHECKOUT_FAILED'
}

export type CartItemUpdate = DeepPartial<CartItem>;
export type CartSummaryWithoutMeta = Omit<CartSummary, 'shipping_method' | 'payment_method' | 'coupon'>;

export interface CartServiceInterface {
  getCart(userId: string): Promise<CartItem[]>;
  addItem(userId: string, input: AddToCartInput): Promise<CartItem>;
  updateItem(userId: string, itemId: string, quantity: number): Promise<CartItem>;
  removeItem(userId: string, itemId: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
  getCartSummary(userId: string): Promise<CartSummary>;
  checkout(userId: string, input: CheckoutInput): Promise<any>;
  applyCoupon(userId: string, code: string): Promise<CartSummary>;
  removeCoupon(userId: string): Promise<void>;
  updateShipping(userId: string, address: string): Promise<CartSummary>;
  getShippingMethods(userId: string): Promise<ShippingMethod[]>;
  updateShippingMethod(userId: string, methodId: string): Promise<CartSummary>;
  getPaymentMethods(): Promise<PaymentMethod[]>;
}

// Redis cache keys
export const CART_CACHE_KEYS = {
  cart: (userId: string) => `cart:${userId}`,
  summary: (userId: string) => `cart:${userId}:summary`,
  shipping: (userId: string) => `cart:${userId}:shipping`,
  coupon: (userId: string) => `cart:${userId}:coupon`
} as const;

// Cart configuration
export const CART_CONFIG = {
  maxQuantity: 99,
  minQuantity: 1,
  taxRate: 0.12, // 12%
  summaryTTL: 300, // 5 minutes
  cartTTL: 604800, // 7 days
  shippingTTL: 3600, // 1 hour
  couponTTL: 3600 // 1 hour
} as const;