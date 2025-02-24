import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import type { SpyInstance } from 'jest-mock';
import testUtils from './helpers';

describe('Test Helpers', () => {
  let dateNowSpy: SpyInstance;

  beforeEach(() => {
    dateNowSpy = jest.spyOn(global.Date, 'now').mockImplementation(() =>
      new Date('2025-01-01').getTime()
    );
    jest.useFakeTimers({
      now: new Date('2025-01-01').getTime(),
    });
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
    jest.useRealTimers();
    testUtils.fetch.reset();
  });

  describe('Response Creation', () => {
    it('creates success response', async () => {
      const data = { id: 1, name: 'Test' };
      const response = testUtils.response.success(data);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const body = await response.json();
      expect(body).toEqual({
        success: true,
        data,
      });
    });

    it('creates error response', async () => {
      const response = testUtils.response.error(
        'VALIDATION_ERROR',
        'Invalid input'
      );

      expect(response.status).toBe(400);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const body = await response.json();
      expect(body).toEqual({
        success: false,
        type: 'VALIDATION_ERROR',
        message: 'Invalid input',
      });
    });

    it('creates custom response', async () => {
      const customBody = { custom: 'data' };
      const response = testUtils.response.create(customBody, {
        status: 201,
        statusText: 'Created',
        headers: {
          'X-Custom': 'test',
        },
      });

      expect(response.status).toBe(201);
      expect(response.statusText).toBe('Created');
      expect(response.headers.get('X-Custom')).toBe('test');

      const body = await response.json();
      expect(body).toEqual(customBody);
    });
  });

  describe('Fetch Mocking', () => {
    it('mocks successful fetch', async () => {
      const data = { id: 1, name: 'Test' };
      testUtils.fetch.success(data);

      const response = await fetch('https://api.example.com/test');
      const body = await response.json();

      expect(response.ok).toBe(true);
      expect(body).toEqual({
        success: true,
        data,
      });
      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/test');
    });

    it('mocks fetch error', async () => {
      testUtils.fetch.error('NOT_FOUND', 'Resource not found', { status: 404 });

      const response = await fetch('https://api.example.com/test');
      const body = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(body).toEqual({
        success: false,
        type: 'NOT_FOUND',
        message: 'Resource not found',
      });
    });

    it('mocks network error', async () => {
      const error = new Error('Network failure');
      testUtils.fetch.networkError(error);

      await expect(fetch('https://api.example.com/test')).rejects.toThrow(error);
    });
  });

  describe('Test Context', () => {
    it('creates default test context', () => {
      const context = testUtils.context();

      expect(context.req).toBeDefined();
      expect(context.res).toBeDefined();
      expect(context.env).toEqual(
        expect.objectContaining({
          NODE_ENV: 'test',
          JWT_SECRET: 'test-secret',
        })
      );
    });

    it('allows context override', () => {
      const context = testUtils.context({
        env: {
          CUSTOM_VAR: 'custom-value',
        },
      });

      expect(context.env).toEqual(
        expect.objectContaining({
          NODE_ENV: 'test',
          JWT_SECRET: 'test-secret',
          CUSTOM_VAR: 'custom-value',
        })
      );
    });
  });

  describe('Time Mocking', () => {
    it('sets specific time', () => {
      testUtils.time.set('2025-01-01');
      expect(new Date().toISOString()).toBe('2025-01-01T00:00:00.000Z');
    });

    it('advances time', () => {
      const start = new Date();
      testUtils.time.advance(1000); // Advance 1 second
      const end = new Date();

      expect(end.getTime() - start.getTime()).toBe(1000);
    });

    it('handles timers', (done) => {
      const callback = jest.fn().mockImplementation(() => {
        expect(callback).toHaveBeenCalled();
        done();
      });

      setTimeout(callback, 1000);
      testUtils.time.advance(1000);
    });
  });
});