import mongoose from 'mongoose';
import TestFactory from '../utils/factories';
import { ProductInteraction } from '../../models/ProductInteraction';

describe('ProductInteraction Model', () => {
  beforeEach(async () => {
    await TestFactory.cleanup();
  });

  describe('Creation', () => {
    test('creates a valid like interaction', async () => {
      const user = await TestFactory.createUser();
      const product = await TestFactory.createProduct();

      const interaction = await ProductInteraction.create({
        user: user._id,
        product: product._id,
        type: 'like',
      });

      expect(interaction._id).toBeDefined();
      expect(interaction.user.toString()).toBe(user._id.toString());
      expect(interaction.product.toString()).toBe(product._id.toString());
      expect(interaction.type).toBe('like');
      expect(interaction.createdAt).toBeDefined();
    });

    test('creates a valid bookmark interaction', async () => {
      const user = await TestFactory.createUser();
      const product = await TestFactory.createProduct();

      const interaction = await ProductInteraction.create({
        user: user._id,
        product: product._id,
        type: 'bookmark',
      });

      expect(interaction._id).toBeDefined();
      expect(interaction.type).toBe('bookmark');
    });

    test('fails with invalid interaction type', async () => {
      const user = await TestFactory.createUser();
      const product = await TestFactory.createProduct();

      await expect(
        ProductInteraction.create({
          user: user._id,
          product: product._id,
          type: 'invalid',
        })
      ).rejects.toThrow();
    });
  });

  describe('Uniqueness', () => {
    test('prevents duplicate interactions of same type', async () => {
      const user = await TestFactory.createUser();
      const product = await TestFactory.createProduct();

      await ProductInteraction.create({
        user: user._id,
        product: product._id,
        type: 'like',
      });

      await expect(
        ProductInteraction.create({
          user: user._id,
          product: product._id,
          type: 'like',
        })
      ).rejects.toThrow();
    });

    test('allows different types of interactions for same user-product pair', async () => {
      const user = await TestFactory.createUser();
      const product = await TestFactory.createProduct();

      await ProductInteraction.create({
        user: user._id,
        product: product._id,
        type: 'like',
      });

      const bookmark = await ProductInteraction.create({
        user: user._id,
        product: product._id,
        type: 'bookmark',
      });

      expect(bookmark._id).toBeDefined();
    });
  });

  describe('Querying', () => {
    test('finds all interactions by user', async () => {
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

      const userInteractions = await ProductInteraction.find({ user: user._id });
      expect(userInteractions).toHaveLength(3);
    });

    test('finds all interactions for a product', async () => {
      const product = await TestFactory.createProduct();
      const users = await Promise.all([
        TestFactory.createUser(),
        TestFactory.createUser(),
        TestFactory.createUser(),
      ]);

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

      const productLikes = await ProductInteraction.find({
        product: product._id,
        type: 'like',
      });
      expect(productLikes).toHaveLength(2);

      const productBookmarks = await ProductInteraction.find({
        product: product._id,
        type: 'bookmark',
      });
      expect(productBookmarks).toHaveLength(1);
    });
  });

  describe('Deletion', () => {
    test('removes interaction when user is deleted', async () => {
      const user = await TestFactory.createUser();
      const product = await TestFactory.createProduct();

      await ProductInteraction.create({
        user: user._id,
        product: product._id,
        type: 'like',
      });

      await user.deleteOne();

      const interaction = await ProductInteraction.findOne({ user: user._id });
      expect(interaction).toBeNull();
    });

    test('removes interaction when product is deleted', async () => {
      const user = await TestFactory.createUser();
      const product = await TestFactory.createProduct();

      await ProductInteraction.create({
        user: user._id,
        product: product._id,
        type: 'bookmark',
      });

      await product.deleteOne();

      const interaction = await ProductInteraction.findOne({ product: product._id });
      expect(interaction).toBeNull();
    });
  });
});