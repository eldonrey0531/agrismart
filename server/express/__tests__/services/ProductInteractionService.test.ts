import mongoose from 'mongoose';
import TestFactory from '../utils/factories';
import { ProductInteractionService } from '../../services/ProductInteractionService';
import { ProductInteraction } from '../../models/ProductInteraction';

describe('ProductInteractionService', () => {
  beforeEach(async () => {
    await TestFactory.cleanup();
  });

  describe('toggleInteraction', () => {
    test('creates new interaction when none exists', async () => {
      const user = await TestFactory.createUser();
      const product = await TestFactory.createProduct();

      const result = await ProductInteractionService.toggleInteraction(
        user._id.toString(),
        product._id.toString(),
        'like'
      );

      expect(result).toEqual({ success: true, action: 'added' });
      
      const interaction = await ProductInteraction.findOne({
        user: user._id,
        product: product._id,
      });
      expect(interaction).toBeTruthy();
      expect(interaction?.type).toBe('like');
    });

    test('removes existing interaction', async () => {
      const user = await TestFactory.createUser();
      const product = await TestFactory.createProduct();

      // Create initial interaction
      await ProductInteraction.create({
        user: user._id,
        product: product._id,
        type: 'like',
      });

      const result = await ProductInteractionService.toggleInteraction(
        user._id.toString(),
        product._id.toString(),
        'like'
      );

      expect(result).toEqual({ success: true, action: 'removed' });
      
      const interaction = await ProductInteraction.findOne({
        user: user._id,
        product: product._id,
      });
      expect(interaction).toBeNull();
    });
  });

  describe('getProductStats', () => {
    test('returns correct stats for a product', async () => {
      const product = await TestFactory.createProduct();
      const users = await Promise.all([
        TestFactory.createUser(),
        TestFactory.createUser(),
        TestFactory.createUser(),
      ]);

      // Create likes and bookmarks
      await Promise.all([
        ProductInteraction.create({
          user: users[0]._id,
          product: product._id,
          type: 'like',
        }),
        ProductInteraction.create({
          user: users[1]._id,
          product: product._id,
          type: 'like',
        }),
        ProductInteraction.create({
          user: users[2]._id,
          product: product._id,
          type: 'bookmark',
        }),
      ]);

      const stats = await ProductInteractionService.getProductStats(
        product._id.toString()
      );

      expect(stats).toEqual({
        likes: 2,
        bookmarks: 1,
      });
    });
  });

  describe('getUserInteractions', () => {
    test('returns user interactions for multiple products', async () => {
      const user = await TestFactory.createUser();
      const products = await Promise.all([
        TestFactory.createProduct(),
        TestFactory.createProduct(),
        TestFactory.createProduct(),
      ]);

      await Promise.all([
        ProductInteraction.create({
          user: user._id,
          product: products[0]._id,
          type: 'like',
        }),
        ProductInteraction.create({
          user: user._id,
          product: products[1]._id,
          type: 'bookmark',
        }),
        ProductInteraction.create({
          user: user._id,
          product: products[2]._id,
          type: 'like',
        }),
      ]);

      const interactions = await ProductInteractionService.getUserInteractions(
        user._id.toString(),
        products.map(p => p._id.toString())
      );

      expect(interactions.likes).toHaveLength(2);
      expect(interactions.bookmarks).toHaveLength(1);
      expect(interactions.likes).toContain(products[0]._id.toString());
      expect(interactions.likes).toContain(products[2]._id.toString());
      expect(interactions.bookmarks).toContain(products[1]._id.toString());
    });
  });

  describe('getPopularProducts', () => {
    test('returns products sorted by popularity', async () => {
      const products = await Promise.all([
        TestFactory.createProduct(),
        TestFactory.createProduct(),
        TestFactory.createProduct(),
      ]);

      const users = await Promise.all([
        TestFactory.createUser(),
        TestFactory.createUser(),
        TestFactory.createUser(),
      ]);

      // Create varied interactions
      await Promise.all([
        // Product 0: 2 likes, 1 bookmark
        ProductInteraction.create({
          user: users[0]._id,
          product: products[0]._id,
          type: 'like',
        }),
        ProductInteraction.create({
          user: users[1]._id,
          product: products[0]._id,
          type: 'like',
        }),
        ProductInteraction.create({
          user: users[2]._id,
          product: products[0]._id,
          type: 'bookmark',
        }),
        // Product 1: 1 like, 2 bookmarks
        ProductInteraction.create({
          user: users[0]._id,
          product: products[1]._id,
          type: 'like',
        }),
        ProductInteraction.create({
          user: users[1]._id,
          product: products[1]._id,
          type: 'bookmark',
        }),
        ProductInteraction.create({
          user: users[2]._id,
          product: products[1]._id,
          type: 'bookmark',
        }),
        // Product 2: 1 like, 1 bookmark
        ProductInteraction.create({
          user: users[0]._id,
          product: products[2]._id,
          type: 'like',
        }),
        ProductInteraction.create({
          user: users[1]._id,
          product: products[2]._id,
          type: 'bookmark',
        }),
      ]);

      const popularProducts = await ProductInteractionService.getPopularProducts(3);

      expect(popularProducts).toHaveLength(3);
      expect(popularProducts[0].productId).toBe(products[0]._id.toString());
      expect(popularProducts[0].likes).toBe(2);
      expect(popularProducts[0].bookmarks).toBe(1);
    });
  });

  describe('getUserLikedProducts and getUserBookmarks', () => {
    test('returns paginated results', async () => {
      const user = await TestFactory.createUser();
      const products = await Promise.all(
        Array(15).fill(null).map(() => TestFactory.createProduct())
      );

      // Create likes for all products
      await Promise.all(
        products.map(product =>
          ProductInteraction.create({
            user: user._id,
            product: product._id,
            type: 'like',
          })
        )
      );

      const page1 = await ProductInteractionService.getUserLikedProducts(
        user._id.toString(),
        1,
        10
      );
      expect(page1.products).toHaveLength(10);
      expect(page1.total).toBe(15);
      expect(page1.pages).toBe(2);

      const page2 = await ProductInteractionService.getUserLikedProducts(
        user._id.toString(),
        2,
        10
      );
      expect(page2.products).toHaveLength(5);
    });
  });

  describe('removal methods', () => {
    test('removes all user interactions', async () => {
      const user = await TestFactory.createUser();
      const products = await Promise.all([
        TestFactory.createProduct(),
        TestFactory.createProduct(),
        TestFactory.createProduct(),
      ]);

      await Promise.all(
        products.map(product =>
          ProductInteraction.create({
            user: user._id,
            product: product._id,
            type: 'like',
          })
        )
      );

      const removedCount = await ProductInteractionService.removeAllUserInteractions(
        user._id.toString()
      );
      expect(removedCount).toBe(3);

      const remaining = await ProductInteraction.countDocuments({ user: user._id });
      expect(remaining).toBe(0);
    });

    test('removes all product interactions', async () => {
      const product = await TestFactory.createProduct();
      const users = await Promise.all([
        TestFactory.createUser(),
        TestFactory.createUser(),
        TestFactory.createUser(),
      ]);

      await Promise.all(
        users.map(user =>
          ProductInteraction.create({
            user: user._id,
            product: product._id,
            type: 'like',
          })
        )
      );

      const removedCount = await ProductInteractionService.removeAllProductInteractions(
        product._id.toString()
      );
      expect(removedCount).toBe(3);

      const remaining = await ProductInteraction.countDocuments({ product: product._id });
      expect(remaining).toBe(0);
    });
  });
});