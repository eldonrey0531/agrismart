import { Response } from 'express';
import { Types } from 'mongoose';
import testUtils from './testUtils';

describe('Test Utilities', () => {
  describe('Response Assertions', () => {
    let mockResponse: any;

    beforeEach(() => {
      mockResponse = {
        statusCode: 200,
        body: { success: true },
      };
    });

    test('assertSuccessResponse validates successful responses', () => {
      expect(() => testUtils.assertSuccessResponse(mockResponse)).not.toThrow();
      
      mockResponse.statusCode = 201;
      expect(() => testUtils.assertSuccessResponse(mockResponse, 201)).not.toThrow();
    });

    test('assertErrorResponse validates error responses', () => {
      mockResponse.statusCode = 400;
      mockResponse.body = { success: false, error: 'Test error' };
      
      expect(() => testUtils.assertErrorResponse(mockResponse)).not.toThrow();
      
      mockResponse.statusCode = 404;
      expect(() => testUtils.assertErrorResponse(mockResponse, 404)).not.toThrow();
    });
  });

  describe('ObjectId Assertions', () => {
    test('assertValidObjectId validates MongoDB ObjectIds', () => {
      const validId = new Types.ObjectId();
      expect(() => testUtils.assertValidObjectId(validId)).not.toThrow();
      
      const invalidId = 'invalid-id';
      expect(() => testUtils.assertValidObjectId(invalidId)).toThrow();
    });

    test('assertObjectIdsEqual compares ObjectIds correctly', () => {
      const id1 = new Types.ObjectId();
      const id2 = new Types.ObjectId(id1.toString());
      const id3 = new Types.ObjectId();

      expect(() => testUtils.assertObjectIdsEqual(id1, id2)).not.toThrow();
      expect(() => testUtils.assertObjectIdsEqual(id1, id3)).toThrow();
    });
  });

  describe('Date Assertions', () => {
    test('assertValidDate validates dates', () => {
      expect(() => testUtils.assertValidDate(new Date())).not.toThrow();
      expect(() => testUtils.assertValidDate(Date.now())).not.toThrow();
      expect(() => testUtils.assertValidDate('invalid-date')).toThrow();
    });

    test('assertRecentDate validates recent dates', () => {
      const now = new Date();
      expect(() => testUtils.assertRecentDate(now)).not.toThrow();

      const oldDate = new Date(Date.now() - 10000);
      expect(() => testUtils.assertRecentDate(oldDate, 5000)).toThrow();
    });
  });

  describe('Entity Assertions', () => {
    test('assertValidUser validates user objects', () => {
      const validUser = testUtils.mockUser();
      expect(() => testUtils.assertValidUser(validUser)).not.toThrow();

      const invalidUser = { name: 'Test' };
      expect(() => testUtils.assertValidUser(invalidUser)).toThrow();
    });

    test('assertValidProduct validates product objects', () => {
      const validProduct = testUtils.mockProduct();
      expect(() => testUtils.assertValidProduct(validProduct)).not.toThrow();

      const invalidProduct = { title: 'Test' };
      expect(() => testUtils.assertValidProduct(invalidProduct)).toThrow();
    });

    test('assertValidOrder validates order objects', () => {
      const validOrder = testUtils.mockOrder();
      expect(() => testUtils.assertValidOrder(validOrder)).not.toThrow();

      const invalidOrder = { quantity: 1 };
      expect(() => testUtils.assertValidOrder(invalidOrder)).toThrow();
    });
  });

  describe('Mock Data Generators', () => {
    test('mockUser generates valid user data', () => {
      const user = testUtils.mockUser();
      expect(user._id).toBeInstanceOf(Types.ObjectId);
      expect(user.email).toMatch(/@test.com$/);
      expect(user.role).toBe('user');

      const customUser = testUtils.mockUser({ role: 'seller', name: 'Custom' });
      expect(customUser.role).toBe('seller');
      expect(customUser.name).toBe('Custom');
    });

    test('mockProduct generates valid product data', () => {
      const product = testUtils.mockProduct();
      expect(product._id).toBeInstanceOf(Types.ObjectId);
      expect(product.seller).toBeInstanceOf(Types.ObjectId);
      expect(product.price).toBe(99.99);

      const customProduct = testUtils.mockProduct({ price: 199.99 });
      expect(customProduct.price).toBe(199.99);
    });

    test('mockOrder generates valid order data', () => {
      const order = testUtils.mockOrder();
      expect(order._id).toBeInstanceOf(Types.ObjectId);
      expect(order.buyer).toBeInstanceOf(Types.ObjectId);
      expect(order.product).toBeInstanceOf(Types.ObjectId);
      expect(order.status).toBe('pending');

      const customOrder = testUtils.mockOrder({ status: 'confirmed' });
      expect(customOrder.status).toBe('confirmed');
    });
  });

  describe('Pagination Assertions', () => {
    test('assertValidPagination validates paginated responses', () => {
      const validResponse = {
        page: 1,
        limit: 10,
        total: 100,
        pages: 10,
        data: [],
      };

      expect(() => testUtils.assertValidPagination(validResponse)).not.toThrow();

      const invalidResponse = {
        page: 1,
        limit: 10,
        data: null,
      };

      expect(() => testUtils.assertValidPagination(invalidResponse as any)).toThrow();
    });
  });
});