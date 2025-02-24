import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { Validator, ValidationError } from '../validator';
import { ProductCategory } from '../../../types/shared';
import schemas from '../schemas';

describe('Validator', () => {
  describe('validate', () => {
    const testSchema = z.object({
      name: z.string().min(3),
      age: z.number().min(18),
      email: z.string().email()
    });

    it('should validate valid data', async () => {
      const validData = {
        name: 'John Doe',
        age: 25,
        email: 'john@example.com'
      };

      const result = await Validator.validate(testSchema, validData);
      expect(result).toEqual(validData);
    });

    it('should throw ValidationError for invalid data', async () => {
      const invalidData = {
        name: 'Jo',
        age: 15,
        email: 'not-an-email'
      };

      await expect(Validator.validate(testSchema, invalidData))
        .rejects.toThrow(ValidationError);
    });

    it('should format validation errors correctly', async () => {
      const invalidData = {
        name: 'Jo',
        age: 15,
        email: 'not-an-email'
      };

      try {
        await Validator.validate(testSchema, invalidData);
      } catch (error) {
        if (error instanceof ValidationError) {
          expect(error.details).toHaveLength(3);
          expect(error.details?.map(d => d.field)).toContain('name');
          expect(error.details?.map(d => d.field)).toContain('age');
          expect(error.details?.map(d => d.field)).toContain('email');
        }
      }
    });
  });

  describe('Product Validation', () => {
    const validProduct = {
      title: 'Fresh Vegetables',
      description: 'Locally grown fresh vegetables',
      price: 99.99,
      quantity: 100,
      category: ProductCategory.VEGETABLES,
      location: {
        type: 'Point' as const,
        coordinates: [120.984, 14.599]
      },
      images: ['https://example.com/image1.jpg']
    };

    it('should validate a valid product', async () => {
      const result = await Validator.validate(schemas.product.base, validProduct);
      expect(result).toEqual(validProduct);
    });

    it('should reject invalid product data', async () => {
      const invalidProduct = {
        ...validProduct,
        price: -1,
        quantity: -5
      };

      await expect(Validator.validate(schemas.product.base, invalidProduct))
        .rejects.toThrow(ValidationError);
    });

    it('should validate product query parameters', async () => {
      const validQuery = {
        category: ProductCategory.VEGETABLES,
        minPrice: 10,
        maxPrice: 100,
        page: 1,
        limit: 20
      };

      const result = await Validator.validate(schemas.product.query, validQuery);
      expect(result).toEqual(validQuery);
    });

    it('should reject invalid query parameters', async () => {
      const invalidQuery = {
        minPrice: 100,
        maxPrice: 10 // min > max should fail
      };

      await expect(Validator.validate(schemas.product.query, invalidQuery))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('File Upload Validation', () => {
    it('should validate valid file data', async () => {
      const validFile = {
        mimetype: 'image/jpeg',
        size: 1024 * 1024 // 1MB
      };

      const result = await Validator.validate(schemas.file.single, validFile);
      expect(result).toEqual(validFile);
    });

    it('should reject invalid file types', async () => {
      const invalidFile = {
        mimetype: 'application/pdf',
        size: 1024 * 1024
      };

