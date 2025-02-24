import request from 'supertest';
import { app } from '../../app';
import { createParams } from '../../types/chatController';

describe('Chat Routes', () => {
  describe('GET /chat/conversations', () => {
    it('should require authentication', async () => {
      const response = await request(app).get('/chat/conversations');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /chat/conversations', () => {
    it('should validate request body', async () => {
      const response = await request(app)
        .post('/chat/conversations')
        .set('Authorization', 'Bearer test-token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('Route Parameters', () => {
    it('should create valid conversation parameters', () => {
      const params = createParams.conversation('123');
      expect(params).toEqual({ conversationId: '123' });
    });

    it('should create valid message parameters', () => {
      const params = createParams.message('456');
      expect(params).toEqual({ messageId: '456' });
    });

    it('should create valid conversation user parameters', () => {
      const params = createParams.conversationUser('123', '456');
      expect(params).toEqual({
        conversationId: '123',
        userId: '456'
      });
    });
  });
});