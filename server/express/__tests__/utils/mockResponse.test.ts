import {
  createMockResponse,
  createJSONResponse,
  createResponseWithLocals,
  hasJSONData,
  getResponseData,
  getResponseCookies,
  MockResponse,
} from './mockResponse';

describe('Mock Response Utilities', () => {
  describe('createMockResponse', () => {
    test('creates response with default values', () => {
      const res = createMockResponse();
      
      expect(res.statusCode).toBe(200);
      expect(res.headersSent).toBe(false);
      expect(res.locals).toEqual({});
    });

    test('accepts custom options', () => {
      const res = createMockResponse({
        locals: { user: { id: 1 } },
      });

      expect(res.locals).toEqual({ user: { id: 1 } });
    });

    test('chainable methods return response instance', () => {
      const res = createMockResponse();
      
      expect(res.status(201)).toBe(res);
      expect(res.json({})).toBe(res);
      expect(res.send('')).toBe(res);
      expect(res.type('text/plain')).toBe(res);
    });
  });

  describe('Response Methods', () => {
    let res: MockResponse;

    beforeEach(() => {
      res = createMockResponse();
    });

    test('status sets statusCode', () => {
      res.status(404);
      expect(res._getStatusCode()).toBe(404);
    });

    test('sendStatus sets statusCode', () => {
      res.sendStatus(500);
      expect(res._getStatusCode()).toBe(500);
    });

    test('send stores response body', () => {
      res.send({ message: 'test' });
      expect(res._getData()).toEqual({ message: 'test' });
    });

    test('json stores JSON response and sets content-type', () => {
      res.json({ message: 'test' });
      expect(res._getData()).toEqual({ message: 'test' });
      expect(res.getHeader('content-type')).toBe('application/json');
    });

    test('end stores response body if provided', () => {
      res.end('test');
      expect(res._getData()).toBe('test');
    });
  });

  describe('Headers', () => {
    let res: MockResponse;

    beforeEach(() => {
      res = createMockResponse();
    });

    test('set accepts string key-value', () => {
      res.set('Content-Type', 'text/plain');
      expect(res.get('content-type')).toBe('text/plain');
    });

    test('set accepts object of headers', () => {
      res.set({
        'Content-Type': 'text/plain',
        'X-Custom': 'test',
      });
      expect(res.get('content-type')).toBe('text/plain');
      expect(res.get('x-custom')).toBe('test');
    });

    test('get returns undefined for non-existent header', () => {
      expect(res.get('x-missing')).toBeUndefined();
    });

    test('type sets content-type header', () => {
      res.type('application/json');
      expect(res.get('content-type')).toBe('application/json');
    });
  });

  describe('Cookies', () => {
    let res: MockResponse;

    beforeEach(() => {
      res = createMockResponse();
    });

    test('cookie stores cookie with options', () => {
      res.cookie('test', 'value', { httpOnly: true });
      const cookies = res._getCookies();
      expect(cookies.test).toEqual({
        value: 'value',
        options: { httpOnly: true },
      });
    });

    test('clearCookie removes cookie', () => {
      res.cookie('test', 'value');
      res.clearCookie('test');
      const cookies = res._getCookies();
      expect(cookies.test).toBeUndefined();
    });
  });

  describe('Utility Functions', () => {
    test('createJSONResponse sets JSON content-type', () => {
      const res = createJSONResponse();
      expect(res.get('content-type')).toBe('application/json');
    });

    test('createResponseWithLocals sets locals', () => {
      const res = createResponseWithLocals({ user: { id: 1 } });
      expect(res.locals).toEqual({ user: { id: 1 } });
    });

    test('hasJSONData correctly identifies JSON responses', () => {
      const res = createMockResponse();
      
      res.json({ test: true });
      expect(hasJSONData(res)).toBe(true);

      const plainRes = createMockResponse();
      plainRes.send('plain text');
      expect(hasJSONData(plainRes)).toBe(false);
    });

    test('getResponseData returns response data', () => {
      const res = createMockResponse();
      const data = { test: true };
      
      res.json(data);
      expect(getResponseData(res)).toEqual(data);
    });

    test('getResponseCookies returns cookies', () => {
      const res = createMockResponse();
      
      res.cookie('test', 'value');
      const cookies = getResponseCookies(res);
      
      expect(cookies).toHaveProperty('test');
      expect(cookies.test.value).toBe('value');
    });
  });
});