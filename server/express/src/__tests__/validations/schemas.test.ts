import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  phoneSchema,
  dateSchema,
  dateRangeSchema,
  mongoIdSchema,
  paginationSchema,
  locationSchema,
  coordinatesSchema
} from '../../validations/common.schema';

describe('Common Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.com',
        'user+tag@domain.co.uk'
      ];

      validEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).not.toThrow();
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'not-an-email',
        '@domain.com',
        'user@',
        'user@.com',
        'user@domain.'
      ];

      invalidEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).toThrow();
      });
    });
  });

  describe('passwordSchema', () => {
    it('should validate strong passwords', () => {
      const validPasswords = [
        'StrongPass123!',
        'Complex1Password@',
        'Abcd123!@#$'
      ];

      validPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).not.toThrow();
      });
    });

    it('should reject weak passwords', () => {
      const invalidPasswords = [
        'short1!',           // too short
        'nouppercasepass1!', // no uppercase
        'NOLOWERCASE123!',   // no lowercase
        'NoSpecialChar123',  // no special char
        'NoNumber@Pass'      // no number
      ];

      invalidPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).toThrow();
      });
    });
  });

  describe('phoneSchema', () => {
    it('should validate Philippines phone numbers', () => {
      const validPhones = [
        '+639123456789',
        '+639987654321'
      ];

      validPhones.forEach(phone => {
        expect(() => phoneSchema.parse(phone)).not.toThrow();
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '09123456789',    // missing +63
        '+6391234567',    // too short
        '+6391234567890', // too long
        '+631234567890',  // invalid prefix
        '1234567890'      // no country code
      ];

      invalidPhones.forEach(phone => {
        expect(() => phoneSchema.parse(phone)).toThrow();
      });
    });
  });

  describe('dateSchema', () => {
    it('should validate valid dates', () => {
      const validDates = [
        new Date(),
        '2024-02-17',
        '2024-02-17T12:00:00Z'
      ];

      validDates.forEach(date => {
        expect(() => dateSchema.parse(date)).not.toThrow();
      });
    });

    it('should reject invalid dates', () => {
      const invalidDates = [
        'not-a-date',
        '2024-13-01',    // invalid month
        '2024-02-30',    // invalid day
        {}
      ];

      invalidDates.forEach(date => {
        expect(() => dateSchema.parse(date)).toThrow();
      });
    });
  });

  describe('dateRangeSchema', () => {
    it('should validate valid date ranges', () => {
      const validRanges = [
        {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31')
        },
        {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-01') // same day is valid
        }
      ];

      validRanges.forEach(range => {
        expect(() => dateRangeSchema.parse(range)).not.toThrow();
      });
    });

    it('should reject invalid date ranges', () => {
      const invalidRanges = [
        {
          startDate: new Date('2024-12-31'),
          endDate: new Date('2024-01-01')
        },
        {
          startDate: 'not-a-date',
          endDate: new Date()
        }
      ];

      invalidRanges.forEach(range => {
        expect(() => dateRangeSchema.parse(range)).toThrow();
      });
    });
  });

  describe('mongoIdSchema', () => {
    it('should validate valid MongoDB ObjectIds', () => {
      const validIds = [
        '507f1f77bcf86cd799439011',
        '000000000000000000000000'
      ];

      validIds.forEach(id => {
        expect(() => mongoIdSchema.parse(id)).not.toThrow();
      });
    });

    it('should reject invalid MongoDB ObjectIds', () => {
      const invalidIds = [
        'not-an-object-id',
        '507f1f77bcf86cd79943901', // too short
        '507f1f77bcf86cd7994390111', // too long
        '507f1f77bcf86cd79943901g' // invalid char
      ];

      invalidIds.forEach(id => {
        expect(() => mongoIdSchema.parse(id)).toThrow();
      });
    });
  });

  describe('paginationSchema', () => {
    it('should validate valid pagination params', () => {
      const validParams = [
        { page: 1, limit: 10 },
        { page: 1, limit: 50, sortBy: 'createdAt' },
        { page: 1, limit: 10, sortOrder: 'desc' }
      ];

      validParams.forEach(params => {
        expect(() => paginationSchema.parse(params)).not.toThrow();
      });
    });

    it('should reject invalid pagination params', () => {
      const invalidParams = [
        { page: 0, limit: 10 },         // page < 1
        { page: 1, limit: 0 },          // limit < 1
        { page: 1, limit: 101 },        // limit > 100
        { page: 1, limit: 10, sortOrder: 'invalid' } // invalid sort order
      ];

      invalidParams.forEach(params => {
        expect(() => paginationSchema.parse(params)).toThrow();
      });
    });
  });

  describe('coordinatesSchema', () => {
    it('should validate valid coordinates', () => {
      const validCoords = [
        { latitude: 0, longitude: 0 },
        { latitude: 90, longitude: 180 },
        { latitude: -90, longitude: -180 }
      ];

      validCoords.forEach(coords => {
        expect(() => coordinatesSchema.parse(coords)).not.toThrow();
      });
    });

    it('should reject invalid coordinates', () => {
      const invalidCoords = [
        { latitude: 91, longitude: 0 },   // latitude > 90
        { latitude: 0, longitude: 181 },  // longitude > 180
        { latitude: -91, longitude: 0 },  // latitude < -90
        { latitude: 0, longitude: -181 }  // longitude < -180
      ];

      invalidCoords.forEach(coords => {
        expect(() => coordinatesSchema.parse(coords)).toThrow();
      });
    });
  });
});