interface MockResponseOptions {
  locals?: Record<string, any>;
  [key: string]: any;
}

/**
 * Simplified mock response type for testing
 */
export interface MockResponse {
  statusCode: number;
  headersSent: boolean;
  locals: Record<string, any>;

  // Essential response methods
  status(code: number): this;
  send(body: any): this;
  json(body: any): this;
  end(chunk?: any): this;
  sendStatus(code: number): this;

  // Headers
  get(field: string): string | undefined;
  set(field: string | Record<string, string>, value?: string): this;
  getHeader(field: string): string | string[] | undefined;
  type(contentType: string): this;

  // Cookies
  cookie(name: string, value: string, options?: any): this;
  clearCookie(name: string, options?: any): this;

  // Test helper methods
  _getStatusCode(): number;
  _getData(): any;
  _getHeaders(): Record<string, string | string[]>;
  _getCookies(): Record<string, { value: string; options?: any }>;
}

/**
 * Creates a mock response object for testing
 */
export function createMockResponse(options: MockResponseOptions = {}): MockResponse {
  const { locals = {}, ...rest } = options;

  let statusCode = 200;
  let responseBody: any = undefined;
  const headers: Record<string, string | string[]> = {};
  const cookies: Record<string, { value: string; options?: any }> = {};

  const mockResponse: MockResponse = {
    statusCode,
    headersSent: false,
    locals,

    status(code: number) {
      statusCode = code;
      return this;
    },

    sendStatus(code: number) {
      statusCode = code;
      return this;
    },

    send(body: any) {
      responseBody = body;
      return this;
    },

    json(body: any) {
      responseBody = body;
      headers['content-type'] = 'application/json';
      return this;
    },

    set(field: string | Record<string, string>, value?: string) {
      if (typeof field === 'string') {
        headers[field.toLowerCase()] = value || '';
      } else {
        for (const key in field) {
          headers[key.toLowerCase()] = field[key];
        }
      }
      return this;
    },

    get(field: string): string | undefined {
      const value = headers[field.toLowerCase()];
      return Array.isArray(value) ? value[0] : value;
    },

    getHeader(field: string): string | string[] | undefined {
      return headers[field.toLowerCase()];
    },

    cookie(name: string, value: string, options?: any) {
      cookies[name] = { value, options };
      return this;
    },

    clearCookie(name: string, options?: any) {
      delete cookies[name];
      return this;
    },

    end(chunk?: any) {
      if (chunk) responseBody = chunk;
      return this;
    },

    type(contentType: string) {
      headers['content-type'] = contentType;
      return this;
    },

    _getStatusCode: () => statusCode,
    _getData: () => responseBody,
    _getHeaders: () => ({ ...headers }),
    _getCookies: () => ({ ...cookies }),

    ...rest,
  };

  return mockResponse;
}

/**
 * Creates a JSON response with pre-configured content type
 */
export function createJSONResponse(options: MockResponseOptions = {}): MockResponse {
  const res = createMockResponse(options);
  res.type('application/json');
  return res;
}

/**
 * Creates a response with locals data
 */
export function createResponseWithLocals(
  locals: Record<string, any>,
  options: MockResponseOptions = {}
): MockResponse {
  return createMockResponse({ ...options, locals });
}

/**
 * Type guard to check if response has JSON data
 */
export function hasJSONData(res: MockResponse): boolean {
  const contentType = res.getHeader('content-type');
  return res._getData() !== undefined && 
    (typeof contentType === 'string' && contentType.includes('application/json'));
}

/**
 * Gets typed response data
 */
export function getResponseData<T = any>(res: MockResponse): T | undefined {
  return res._getData();
}

/**
 * Gets response cookies
 */
export function getResponseCookies(res: MockResponse): Record<string, { value: string; options?: any }> {
  return res._getCookies();
}

export default {
  createMockResponse,
  createJSONResponse,
  createResponseWithLocals,
  hasJSONData,
  getResponseData,
  getResponseCookies,
};