import mongoose from 'mongoose';
import TestFactory from './factories';
import { User, Product, Order } from '../../models';
import type { TestUser, TestProduct, TestOrder } from './types';
import { isTestUser, isTestProduct, isTestOrder } from './types';

describe('TestFactory', () => {
  beforeAll(async () => {
    await TestFactory.initialize();
  });

  afterAll(async () => {
    await TestFactory.cleanup();
    await mongoose.disconnect();
  });

  afterEach(async () => {
    await TestFactory.cleanup();
  });

  describe('User Factory', () => {
    test('creates a user with default values', async () => {
      const user = await TestFactory.createUser();

      expect(user._id).toBeDefined();
      expect(user.email).toMatch(/@test.com$/);
      expect(user.role).toBe('user');
      expect(user.status).toBe('active');
      expect(user.verified).toBe(true);
      expect(isTestUser(user)).toBe(true);
    });

    test('creates a user with custom values', async () => {
      const customUser = await TestFactory.createUser({
        email: 'custom@test.com',
        name: 'Custom User',
        role: 'seller',
      });

      expect(customUser.email).toBe('custom@test.com');
      expect(customUser.name).toBe('Custom User');
      expect(customUser.role).toBe('seller');
    });

    test('creates multiple users', async () => {
      const { documents: users, cleanup } = await TestFactory.createManyUsers(3);

      expect(users).toHaveLength(3);
      users.forEach(user => {
        expect(isTestUser(user)).toBe(true);
      });

      await cleanup();
      const remainingUsers = await User.countDocuments();
      expect(remainingUsers).toBe(0);
    });
  });

  describe('Product Factory', () => {
    test('creates a product with default values', async () => {
      const product = await TestFactory.createProduct();

      expect(product._id).toBeDefined();
      expect(product.title).toMatch(/Test Product/);
      expect(product.price).toBe(99.99);
      expect(product.status).toBe('active');
      expect(isTestProduct(product)).toBe(true);
    });

    test('creates a product with custom values', async () => {
      const customProduct = await TestFactory.createProduct({
        title: 'Custom Product',
        price: 199.99,
        category: 'custom',
      });

      expect(customProduct.title).toBe('Custom Product');
      expect(customProduct.price).toBe(199.99);
      expect(customProduct.category).toBe('custom');
    });

    test('creates multiple products', async () => {
      const { documents: products, cleanup } = await TestFactory.createManyProducts(3);

      expect(products).toHaveLength(3);
      products.forEach(product => {
        expect(isTestProduct(product)).toBe(true);
      });

      await cleanup();
      const remainingProducts = await Product.countDocuments();
      expect(remainingProducts).toBe(0);
    });
  });

  describe('Order Factory', () => {
    test('creates an order with default values', async () => {
      const order = await TestFactory.createOrder();

      expect(order._id).toBeDefined();
      expect(order.quantity).toBe(1);
      expect(order.status).toBe('pending');
      expect(order.paymentStatus).toBe('pending');
      expect(isTestOrder(order)).toBe(true);
    });

    test('creates an order with custom values', async () => {
      const buyer = await TestFactory.createUser();
      const product = await TestFactory.createProduct();

      const customOrder = await TestFactory.createOrder({
        buyer: buyer._id,
        product: product._id,
        quantity: 2,
        totalPrice: 199.98,
        status: 'confirmed',
      });

      expect(customOrder.buyer.toString()).toBe(buyer._id.toString());
      expect(customOrder.product.toString()).toBe(product._id.toString());
      expect(customOrder.quantity).toBe(2);
      expect(customOrder.totalPrice).toBe(199.98);
      expect(customOrder.status).toBe('confirmed');
    });

    test('creates multiple orders', async () => {
      const { documents: orders, cleanup } = await TestFactory.createManyOrders(3);

      expect(orders).toHaveLength(3);
      orders.forEach(order => {
        expect(isTestOrder(order)).toBe(true);
      });

      await cleanup();
      const remainingOrders = await Order.countDocuments();
      expect(remainingOrders).toBe(0);
    });
  });

  describe('Document Conversion', () => {
    test('converts user document to test user', async () => {
      const userDoc = await User.create({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'user',
        status: 'active',
      });

      const testUser = TestFactory.toTestUser(userDoc);
      expect(isTestUser(testUser)).toBe(true);
      expect(testUser._id).toBeDefined();
      expect(testUser.email).toBe('test@example.com');
    });

    test('converts product document to test product', async () => {
      const seller = await TestFactory.createUser();
      const productDoc = await Product.create({
        title: 'Test Product',
        description: 'Description',
        price: 99.99,
        category: 'test',
        seller: seller._id,
        status: 'active',
        location: {
          type: 'Point',
          coordinates: [0, 0],
          address: 'Test Address',
        },
        images: ['test.jpg'],
      });

      const testProduct = TestFactory.toTestProduct(productDoc);
      expect(isTestProduct(testProduct)).toBe(true);
      expect(testProduct._id).toBeDefined();
      expect(testProduct.title).toBe('Test Product');
    });

    test('converts order document to test order', async () => {
      const buyer = await TestFactory.createUser();
      const product = await TestFactory.createProduct();
      const orderDoc = await Order.create({
        buyer: buyer._id,
        product: product._id,
        quantity: 1,
        totalPrice: 99.99,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress: {
          street: 'Test St',
          city: 'Test City',
          state: 'Test State',
          country: 'Test Country',
          postalCode: '12345',
        },
      });

      const testOrder = TestFactory.toTestOrder(orderDoc);
      expect(isTestOrder(testOrder)).toBe(true);
      expect(testOrder._id).toBeDefined();
      expect(testOrder.buyer.toString()).toBe(buyer._id.toString());
      expect(testOrder.product.toString()).toBe(product._id.toString());
    });
  });
});