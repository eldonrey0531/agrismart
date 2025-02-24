import { describe, test, expect } from 'vitest';
import { formSchemas, validateInput, baseSchemas } from '../../utils/validation';

describe('Validation Utilities', () => {
  describe('Base Schema Validation', () => {
    test('validates email format', async () => {
      const validEmail = 'test@example.com';
      const invalidEmail = 'invalid-email';

      const validResult = await validateInput(baseSchemas.email, validEmail);
      const invalidResult = await validateInput(baseSchemas.email, invalidEmail);

      expect(validResult.success).toBe(true);
      expect(invalidResult.success).toBe(false);
    });

    test('validates password requirements', async () => {
      const validPassword = 'Test123!@';
      const invalidPasswords = [
        'short',             // Too short
        'nouppercase123!',   // No uppercase
        'NOLOWERCASE123!',   // No lowercase
        'NoSpecialChar123',  // No special char
        'NoNumber!@#',       // No number
      ];

      const validResult = await validateInput(baseSchemas.password, validPassword);
      expect(validResult.success).toBe(true);

      for (const password of invalidPasswords) {
        const result = await validateInput(baseSchemas.password, password);
        expect(result.success).toBe(false);
      }
    });

    test('validates phone number format', async () => {
      const validPhone = '+12345678901';
      const invalidPhones = ['12345678901', 'abc', '+abc', '+'];

      const validResult = await validateInput(baseSchemas.phone, validPhone);
      expect(validResult.success).toBe(true);

      for (const phone of invalidPhones) {
        const result = await validateInput(baseSchemas.phone, phone);
        expect(result.success).toBe(false);
      }
    });
  });

  describe('Form Schema Validation', () => {
    test('validates login form', async () => {
      const validLogin = {
        email: 'test@example.com',
        password: 'password123',
      };

      const invalidLogin = {
        email: 'invalid-email',
        password: '',
      };

      const validResult = await validateInput(formSchemas.login, validLogin);
      const invalidResult = await validateInput(formSchemas.login, invalidLogin);

      expect(validResult.success).toBe(true);
      expect(invalidResult.success).toBe(false);
    });

    test('validates product creation form', async () => {
      const validProduct = {
        title: 'Test Product',
        description: 'A detailed description of the test product',
        price: 99.99,
        category: 'electronics',
        location: {
          coordinates: [121.1234, 14.5678],
          address: '123 Test Street, City',
        },
        images: ['https://example.com/image1.jpg'],
      };

      const invalidProduct = {
        title: 'Te',  // Too short
        description: 'Short',  // Too short
        price: -10,  // Negative price
        category: '',  // Empty category
        location: {
          coordinates: [200, 100],  // Invalid coordinates
          address: '',  // Empty address
        },
        images: [],  // No images
      };

      const validResult = await validateInput(formSchemas.productCreate, validProduct);
      const invalidResult = await validateInput(formSchemas.productCreate, invalidProduct);

      expect(validResult.success).toBe(true);
      expect(invalidResult.success).toBe(false);
    });

    test('validates order creation form', async () => {
      const validOrder = {
        productId: '507f1f77bcf86cd799439011',
        quantity: 2,
        shippingAddress: '123 Shipping Street, City, Country',
        paymentMethod: 'card' as const,
      };

      const invalidOrder = {
        productId: 'invalid-id',
        quantity: 0,
        shippingAddress: 'short',
        paymentMethod: 'invalid' as const,
      };

      const validResult = await validateInput(formSchemas.orderCreate, validOrder);
      const invalidResult = await validateInput(formSchemas.orderCreate, invalidOrder);

      expect(validResult.success).toBe(true);
      expect(invalidResult.success).toBe(false);
    });

    test('validates report creation form', async () => {
      const validReport = {
        contentType: 'product' as const,
        contentId: '507f1f77bcf86cd799439011',
        reason: 'inappropriate' as const,
        description: 'This is a detailed description of the issue',
      };

      const invalidReport = {
        contentType: 'invalid' as const,
        contentId: 'invalid-id',
        reason: 'invalid' as const,
        description: 'short',
      };

      const validResult = await validateInput(formSchemas.report, validReport);
      const invalidResult = await validateInput(formSchemas.report, invalidReport);

      expect(validResult.success).toBe(true);
      expect(invalidResult.success).toBe(false);
    });
  });

  describe('Error Messages', () => {
    test('returns appropriate error messages for invalid inputs', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'short',
      };

      const result = await validateInput(formSchemas.login, invalidData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
    });
  });
});