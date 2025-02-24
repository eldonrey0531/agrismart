import mongoose from 'mongoose';
import { User, Product, Order } from '../../models';
import TestDb from './testDb';
import type {
  TestUser,
  TestProduct,
  TestOrder,
  TestCollection,
  CreateUserInput,
  CreateProductInput,
  CreateOrderInput,
  DocumentToTest,
} from './types';

class TestFactory {
  static async initialize(): Promise<void> {
    if (!TestDb.isConnected()) {
      await TestDb.connect();
    }
  }

  static async cleanup(): Promise<void> {
    await TestDb.clearDatabase();
  }

  static toTestUser(doc: any): TestUser {
    return {
      _id: doc._id,
      email: doc.email,
      password: doc.password,
      name: doc.name,
      role: doc.role,
      status: doc.status,
      verified: doc.verified || false,
      avatar: doc.avatar,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toTestProduct(doc: any): TestProduct {
    return {
      _id: doc._id,
      title: doc.title,
      description: doc.description,
      price: doc.price,
      category: doc.category,
      seller: doc.seller,
      status: doc.status,
      location: doc.location,
      images: doc.images,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toTestOrder(doc: any): TestOrder {
    return {
      _id: doc._id,
      buyer: doc.buyer,
      product: doc.product,
      quantity: doc.quantity,
      totalPrice: doc.totalPrice,
      status: doc.status,
      paymentStatus: doc.paymentStatus,
      shippingAddress: {
        street: doc.shippingAddress.street,
        city: doc.shippingAddress.city,
        state: doc.shippingAddress.state,
        country: doc.shippingAddress.country,
        postalCode: doc.shippingAddress.postalCode,
      },
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static async createUser(override: CreateUserInput = {}): Promise<TestUser> {
    await this.initialize();
    
    const defaultUser = {
      email: `user-${Date.now()}@test.com`,
      password: 'Password123!',
      name: 'Test User',
      role: 'user' as const,
      status: 'active' as const,
      verified: true,
    };

    const doc = await User.create({ ...defaultUser, ...override });
    return this.toTestUser(doc);
  }

  static async createProduct(override: CreateProductInput = {}): Promise<TestProduct> {
    await this.initialize();

    const seller = override.seller || (await this.createUser({ role: 'seller' }))._id;
    
    const defaultProduct = {
      title: `Test Product ${Date.now()}`,
      description: 'A test product description',
      price: 99.99,
      category: 'electronics',
      seller,
      status: 'active' as const,
      location: {
        type: 'Point' as const,
        coordinates: [0, 0],
        address: 'Test Address',
      },
      images: ['test-image-1.jpg', 'test-image-2.jpg'],
    };

    const doc = await Product.create({ ...defaultProduct, ...override });
    return this.toTestProduct(doc);
  }

  static async createOrder(override: CreateOrderInput = {}): Promise<TestOrder> {
    await this.initialize();

    const buyer = override.buyer || (await this.createUser())._id;
    const product = override.product || (await this.createProduct())._id;
    
    const defaultOrder = {
      buyer,
      product,
      quantity: 1,
      totalPrice: 99.99,
      status: 'pending' as const,
      paymentStatus: 'pending' as const,
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        postalCode: '12345',
      },
    };

    const doc = await Order.create({ ...defaultOrder, ...override });
    return this.toTestOrder(doc);
  }

  static async createManyUsers(
    count: number,
    override: CreateUserInput = {}
  ): Promise<TestCollection<TestUser>> {
    const documents = await Promise.all(
      Array.from({ length: count }, async (_, index) => {
        return this.createUser({
          email: `user-${Date.now()}-${index}@test.com`,
          ...override,
        });
      })
    );

    return {
      documents,
      cleanup: async () => {
        await User.deleteMany({
          _id: { $in: documents.map(doc => doc._id) },
        });
      },
    };
  }

  static async createManyProducts(
    count: number,
    override: CreateProductInput = {}
  ): Promise<TestCollection<TestProduct>> {
    const seller = override.seller || (await this.createUser({ role: 'seller' }))._id;

    const documents = await Promise.all(
      Array.from({ length: count }, async (_, index) => {
        return this.createProduct({
          title: `Test Product ${Date.now()}-${index}`,
          seller,
          ...override,
        });
      })
    );

    return {
      documents,
      cleanup: async () => {
        await Product.deleteMany({
          _id: { $in: documents.map(doc => doc._id) },
        });
      },
    };
  }

  static async createManyOrders(
    count: number,
    override: CreateOrderInput = {}
  ): Promise<TestCollection<TestOrder>> {
    const buyer = override.buyer || (await this.createUser())._id;
    const product = override.product || (await this.createProduct())._id;

    const documents = await Promise.all(
      Array.from({ length: count }, () => {
        return this.createOrder({
          buyer,
          product,
          ...override,
        });
      })
    );

    return {
      documents,
      cleanup: async () => {
        await Order.deleteMany({
          _id: { $in: documents.map(doc => doc._id) },
        });
      },
    };
  }

  static generateObjectId(): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId();
  }
}

export default TestFactory;