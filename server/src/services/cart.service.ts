import { PrismaClient, Product } from '@prisma/client';
import { redis } from '../lib/redis';
import { throwError } from '../lib/errors';
import { CartItem, CartSummary, CartServiceInterface, CART_CACHE_KEYS, CART_CONFIG, CartError, CartErrorCode, ShippingMethod, PaymentMethod } from '../types/cart';

const prisma = new PrismaClient();

export class CartService implements CartServiceInterface {
  static async getCart(userId: string): Promise<CartItem[]> {
    const cacheKey = CART_CACHE_KEYS.cart(userId);
    const cached = await redis.get<CartItem[]>(cacheKey);
    if (cached) return cached;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            stock: true,
            images: true
          }
        }
      }
    });

    const items = cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price,
      subtotal: item.product.price * item.quantity,
      product: {
        ...item.product,
        image: item.product.images[0]
      }
    }));

    await redis.set(cacheKey, items, CART_CONFIG.cartTTL);
    return items;
  }

  static async addItem(userId: string, input: { productId: string; quantity: number }): Promise<CartItem> {
    const { productId, quantity } = input;

    if (quantity < CART_CONFIG.minQuantity || quantity > CART_CONFIG.maxQuantity) {
      throwError.badRequest('Invalid quantity', CartErrorCode.INVALID_QUANTITY);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throwError.notFound('Product not found');
    }

    if (product.stock < quantity) {
      throwError.badRequest('Insufficient stock', CartErrorCode.INSUFFICIENT_STOCK);
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { userId, productId }
    });

    let cartItem;
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        throwError.badRequest('Insufficient stock', CartErrorCode.INSUFFICIENT_STOCK);
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              stock: true,
              images: true
            }
          }
        }
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity
        },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              stock: true,
              images: true
            }
          }
        }
      });
    }

    await this.invalidateCache(userId);

    return {
      id: cartItem.id,
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      price: cartItem.product.price,
      subtotal: cartItem.product.price * cartItem.quantity,
      product: {
        ...cartItem.product,
        image: cartItem.product.images[0]
      }
    };
  }

  static async updateItem(userId: string, itemId: string, quantity: number): Promise<CartItem> {
    if (quantity < CART_CONFIG.minQuantity || quantity > CART_CONFIG.maxQuantity) {
      throwError.badRequest('Invalid quantity', CartErrorCode.INVALID_QUANTITY);
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: itemId, userId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            stock: true,
            images: true
          }
        }
      }
    });

    if (!cartItem) {
      throwError.notFound('Cart item not found', CartErrorCode.ITEM_NOT_FOUND);
    }

    if (quantity > cartItem.product.stock) {
      throwError.badRequest('Insufficient stock', CartErrorCode.INSUFFICIENT_STOCK);
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            stock: true,
            images: true
          }
        }
      }
    });

    await this.invalidateCache(userId);

    return {
      id: updated.id,
      productId: updated.productId,
      quantity: updated.quantity,
      price: updated.product.price,
      subtotal: updated.product.price * updated.quantity,
      product: {
        ...updated.product,
        image: updated.product.images[0]
      }
    };
  }

  static async removeItem(userId: string, itemId: string): Promise<void> {
    const cartItem = await prisma.cartItem.findFirst({
      where: { id: itemId, userId }
    });

    if (!cartItem) {
      throwError.notFound('Cart item not found', CartErrorCode.ITEM_NOT_FOUND);
    }

    await prisma.cartItem.delete({
      where: { id: itemId }
    });

    await this.invalidateCache(userId);
  }

  static async clearCart(userId: string): Promise<void> {
    await prisma.cartItem.deleteMany({
      where: { userId }
    });

    await this.invalidateCache(userId);
  }

  private static async invalidateCache(userId: string): Promise<void> {
    const keys = [
      CART_CACHE_KEYS.cart(userId),
      CART_CACHE_KEYS.summary(userId)
    ];
    await redis.del(keys);
  }

  // Additional methods based on CartServiceInterface...
  // Implement remaining methods as needed

  private static calculateCartTotals(items: CartItem[]): CartSummary {
    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    const tax = subtotal * CART_CONFIG.taxRate;
    const total = subtotal + tax;

    return {
      items,
      subtotal,
      tax,
      shipping: 0, // Will be updated when shipping method is selected
      total,
      itemCount: items.length
    };
  }
}