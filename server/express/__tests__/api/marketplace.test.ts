import request from 'supertest';
import { app } from '../../app';
import { prisma } from '../../utils/prisma';
import { FileStorageService } from '../../services/FileStorageService';
import { createTestUser } from '../utils/auth';
import { Role } from '../../models/types/Role';

describe('Marketplace API', () => {
  let sellerToken: string;
  let sellerId: string;
  let categoryId: string;
  let productId: string;

  beforeAll(async () => {
    // Create seller user
    const seller = await createTestUser({
      role: Role.SELLER,
      status: 'ACTIVE'
    });
    sellerToken = seller.token;
    sellerId = seller.id;

    // Create test category
    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
        description: 'Test Category Description',
        level: 0,
        order: 0
      }
    });
    categoryId = category.id;
  });

  afterAll(async () => {
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('GET /marketplace/search', () => {
    it('should search products successfully', async () => {
      const res = await request(app)
        .get('/marketplace/search')
        .query({
          q: 'test',
          page: '1',
          pageSize: '10'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('pageSize');
      expect(res.body).toHaveProperty('facets');
    });

    it('should validate search parameters', async () => {
      const res = await request(app)
        .get('/marketplace/search')
        .query({
          page: '-1', // Invalid page
          pageSize: '1000' // Too large
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('GET /marketplace/categories', () => {
    it('should return categories successfully', async () => {
      const res = await request(app).get('/marketplace/categories');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('categories');
      expect(res.body).toHaveProperty('total');
      expect(res.body.categories).toBeInstanceOf(Array);
    });
  });

  describe('POST /marketplace/products', () => {
    it('should create product successfully', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        categoryId,
        condition: 'new',
        images: []
      };

      const res = await request(app)
        .post('/marketplace/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(productData);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        ...productData,
        sellerId,
        id: expect.any(String)
      });

      productId = res.body.id;
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/marketplace/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/marketplace/products')
        .send({
          name: 'Test Product',
          description: 'Test Description',
          price: 100,
          categoryId,
          condition: 'new'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /marketplace/products/:id', () => {
    it('should update product successfully', async () => {
      const updateData = {
        name: 'Updated Product',
        price: 200
      };

      const res = await request(app)
        .put(`/marketplace/products/${productId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(updateData);
    });

    it('should validate owner access', async () => {
      const otherUser = await createTestUser({
        role: Role.SELLER,
        status: 'ACTIVE'
      });

      const res = await request(app)
        .put(`/marketplace/products/${productId}`)
        .set('Authorization', `Bearer ${otherUser.token}`)
        .send({ name: 'Unauthorized Update' });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /marketplace/products/:id/images', () => {
    const mockFile = Buffer.from('test image');
    const mockFileId = 'test-file-id';

    beforeEach(() => {
      jest.spyOn(FileStorageService, 'uploadImages').mockResolvedValue([mockFileId]);
    });

    it('should upload images successfully', async () => {
      const res = await request(app)
        .post(`/marketplace/products/${productId}/images`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .attach('images', mockFile, 'test.jpg');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('fileIds');
      expect(res.body.fileIds).toContain(mockFileId);
    });

    it('should validate file type and size', async () => {
      const res = await request(app)
        .post(`/marketplace/products/${productId}/images`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .attach('images', Buffer.from('invalid'), 'test.txt');

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /marketplace/products/:id', () => {
    it('should delete product successfully', async () => {
      const res = await request(app)
        .delete(`/marketplace/products/${productId}`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);

      // Verify deletion
      const deleted = await prisma.product.findUnique({
        where: { id: productId }
      });
      expect(deleted).toBeNull();
    });
  });
});