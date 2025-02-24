import { describe, expect, it } from '@jest/globals';
import { 
  loginSchema, 
  signupSchema, 
  changePasswordSchema,
  updateProfileSchema,
  resetPasswordSchema,
} from '../auth';
import {
  createConversationSchema,
  updateConversationSchema,
  sendMessageSchema,
  getMessagesSchema,
  searchConversationsSchema,
  searchMessagesSchema,
  messageReactionSchema,
  conversationParticipantsSchema,
} from '../chat';
import { UserRole } from '../../types/shared';
import { z } from 'zod';

describe('Validation Schemas', () => {
  describe('Auth Schemas', () => {
    describe('loginSchema', () => {
      it('validates correct login data', () => {
        const validData = {
          email: 'test@example.com',
          password: 'Password123',
        };
        expect(loginSchema.parse(validData)).toEqual(validData);
      });

      it('rejects invalid email', () => {
        const invalidData = {
          email: 'not-an-email',
          password: 'Password123',
        };
        expect(() => loginSchema.parse(invalidData))
          .toThrow(z.ZodError);
      });

      it('rejects short password', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'short',
        };
        expect(() => loginSchema.parse(invalidData))
          .toThrow(z.ZodError);
      });
    });

    describe('signupSchema', () => {
      it('validates complete signup data', () => {
        const validData = {
          email: 'test@example.com',
          password: 'Password123',
          role: UserRole.USER,
        };
        expect(signupSchema.parse(validData)).toEqual(validData);
      });

      it('uses default role when not provided', () => {
        const data = {
          email: 'test@example.com',
          password: 'Password123',
        };
        const result = signupSchema.parse(data);
        expect(result.role).toBe(UserRole.USER);
      });

      it('validates admin role', () => {
        const adminData = {
          email: 'admin@example.com',
          password: 'Password123',
          role: UserRole.ADMIN,
        };
        expect(signupSchema.parse(adminData)).toEqual(adminData);
      });
    });
  });

  describe('Chat Schemas', () => {
    describe('createConversationSchema', () => {
      it('validates conversation creation', () => {
        const validData = {
          name: 'Test Chat',
          participants: ['user1', 'user2'],
        };
        expect(createConversationSchema.parse(validData)).toEqual(validData);
      });

      it('rejects empty participant list', () => {
        const invalidData = {
          name: 'Test Chat',
          participants: [],
        };
        expect(() => createConversationSchema.parse(invalidData))
          .toThrow(z.ZodError);
      });
    });

    describe('sendMessageSchema', () => {
      it('validates message content', () => {
        const validData = {
          content: 'Hello, world!',
        };
        expect(sendMessageSchema.parse(validData)).toEqual(validData);
      });

      it('rejects empty message', () => {
        const invalidData = {
          content: '',
        };
        expect(() => sendMessageSchema.parse(invalidData))
          .toThrow(z.ZodError);
      });

      it('rejects too long message', () => {
        const invalidData = {
          content: 'a'.repeat(2001),
        };
        expect(() => sendMessageSchema.parse(invalidData))
          .toThrow(z.ZodError);
      });
    });

    describe('searchSchemas', () => {
      it('validates conversation search with defaults', () => {
        const data = {
          query: 'test',
        };
        const result = searchConversationsSchema.parse(data);
        expect(result).toEqual({
          query: 'test',
          page: 1,
          limit: 20,
          type: 'all',
        });
      });

      it('validates message search with conversation', () => {
        const data = {
          query: 'test',
          conversationId: '123',
          page: 2,
          limit: 50,
        };
        expect(searchMessagesSchema.parse(data)).toEqual(data);
      });
    });
  });
});