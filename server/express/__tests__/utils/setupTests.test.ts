import { setupTest, setupAuthTest, generateTestData, wait } from './setupTests';
import TestDb from './testDb';

describe('Test Setup Utilities', () => {
  afterEach(async () => {
    await TestDb.clearDatabase();
    vi.clearAllMocks();
  });

  describe('setupTest', () => {
    test('creates basic test environment', async () => {
      const { req, res, next, cleanup } = await setupTest();

      expect(req).toBeDefined();
      expect(res).toBeDefined();
      expect(next).toBeDefined();
      expect(typeof cleanup).toBe('function');

      await cleanup();
    });

    test('creates environment with database connection', async () => {
      const { cleanup } = await setupTest({ withDb: true });

      expect(TestDb.isConnected()).toBe(true);

      await cleanup();
    });

    test('creates environment with user', async () => {
      const { user, cleanup } = await setupTest({ withDb: true, withUser: true });

      expect(user).toBeDefined();
      expect(user?._id).toBeDefined();
      expect(user?.email).toBeDefined();
      expect(user?.role).toBe('user');

      await cleanup();
    });

    test('creates environment with product', async () => {
      const { product, cleanup } = await setupTest({ withDb: true, withProduct: true });

      expect(product).toBeDefined();
      expect(product?._id).toBeDefined();
      expect(product?.title).toBeDefined();
      expect(product?.seller).toBeDefined();

      await cleanup();
    });

    test('creates environment with order', async () => {
      const { order, cleanup } = await setupTest({ withDb: true, withOrder: true });

      expect(order).toBeDefined();
      expect(order?._id).toBeDefined();
      expect(order?.buyer).toBeDefined();
      expect(order?.product).toBeDefined();

      await cleanup();
    });

    test('creates complete test environment', async () => {
      const { user, product, order, cleanup } = await setupTest({
        withDb: true,
        withUser: true,
        withProduct: true,
        withOrder: true,
      });

      expect(user).toBeDefined();
      expect(product).toBeDefined();
      expect(order).toBeDefined();

      // Verify relationships
      expect(product?.seller.toString()).toBe(user?._id.toString());
      expect(order?.buyer.toString()).toBe(user?._id.toString());
      expect(order?.product.toString()).toBe(product?._id.toString());

      await cleanup();
    });
  });

  describe('setupAuthTest', () => {
    test('creates authenticated user environment', async () => {
      const { req, user, cleanup } = await setupAuthTest();

      expect(user).toBeDefined();
      expect(user?.role).toBe('user');
      expect(req.user).toBeDefined();
      expect(req.user?._id.toString()).toBe(user?._id.toString());

      await cleanup();
    });

    test('creates admin environment', async () => {
      const { user, cleanup } = await setupAuthTest('admin');

      expect(user).toBeDefined();
      expect(user?.role).toBe('admin');

      await cleanup();
    });

    test('creates seller environment', async () => {
      const { user, cleanup } = await setupAuthTest('seller');

      expect(user).toBeDefined();
      expect(user?.role).toBe('seller');

      await cleanup();
    });
  });

  describe('generateTestData', () => {
    test('generates unique test data', () => {
      const data1 = generateTestData();
      const data2 = generateTestData();

      expect(data1.id).toBeDefined();
      expect(data1.timestamp).toBeDefined();
      expect(data1.randomString).toBeDefined();

      expect(data1.id).not.toBe(data2.id);
      expect(data1.timestamp).not.toBe(data2.timestamp);
      expect(data1.randomString).not.toBe(data2.randomString);
    });
  });

  describe('wait', () => {
    test('waits for specified time', async () => {
      const start = Date.now();
      await wait(100);
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(100);
    });
  });
});