import { expect } from '@jest/globals';
import { ErrorUtils } from './test-errors';
import type { ErrorResponse, ApiResponse, SuccessResponse } from './response-types';

/**
 * HTTP Method types
 */
export const HttpMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export type HttpMethod = typeof HttpMethod[keyof typeof HttpMethod];

/**
 * Common header factories
 */
export const HeaderFactories = {
  json: (): Record<string, string> => ({
    'Content-Type': 'application/json',
  }),
  
  form: (): Record<string, string> => ({
    'Content-Type': 'application/x-www-form-urlencoded',
  }),
  
  auth: (token: string): Record<string, string> => ({
    'Authorization': `Bearer ${token}`,
  }),
};

/**
 * Request builder
 */
export class RequestBuilder {
  private init: RequestInit = {};
  private headerMap: Record<string, string> = {};
  private searchParams = new URLSearchParams();

  constructor(private url: string) {}

  /**
   * Set HTTP method
   */
  method(method: HttpMethod): this {
    this.init.method = method;
    return this;
  }

  /**
   * Add headers
   */
  withHeaders(headers: Record<string, string>): this {
    this.headerMap = { ...this.headerMap, ...headers };
    return this;
  }

  /**
   * Set JSON body
   */
  json(data: unknown): this {
    this.withHeaders(HeaderFactories.json());
    this.init.body = JSON.stringify(data);
    return this;
  }

  /**
   * Set form data
   */
  form(data: Record<string, string>): this {
    this.withHeaders(HeaderFactories.form());
    this.init.body = new URLSearchParams(data).toString();
    return this;
  }

  /**
   * Add auth token
   */
  auth(token: string): this {
    this.withHeaders(HeaderFactories.auth(token));
    return this;
  }

  /**
   * Add query parameters
   */
  query(params: Record<string, string>): this {
    Object.entries(params).forEach(([key, value]) => {
      this.searchParams.append(key, value);
    });
    return this;
  }

  /**
   * Build request
   */
  build(): Request {
    const url = new URL(this.url);
    this.searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    return new Request(url.toString(), {
      ...this.init,
      headers: this.headerMap,
    });
  }
}

/**
 * Response assertions
 */
export const HttpAssertions = {
  /**
   * Assert successful response
   */
  async assertSuccess<T>(
    response: Response,
    expectedData?: T,
    status = 200
  ): Promise<SuccessResponse<T>> {
    expect(response.status).toBe(status);
    expect(response.ok).toBe(true);

    const data = await response.json() as ApiResponse<T>;
    expect(data.success).toBe(true);

    if (expectedData) {
      expect((data as SuccessResponse<T>).data).toEqual(expectedData);
    }

    return data as SuccessResponse<T>;
  },

  /**
   * Assert error response
   */
  async assertError(
    response: Response,
    expectedError: {
      type: string;
      message?: string;
      status: number;
    }
  ): Promise<ErrorResponse> {
    expect(response.status).toBe(expectedError.status);
    expect(response.ok).toBe(false);

    const data = await response.json() as ApiResponse;
    expect(data.success).toBe(false);

    const errorData = data as ErrorResponse;
    expect(errorData.type).toBe(expectedError.type);

    if (expectedError.message) {
      expect(errorData.message).toBe(expectedError.message);
    }

    return errorData;
  },

  /**
   * Assert response headers
   */
  assertHeaders(
    response: Response,
    expectedHeaders: Record<string, string>
  ): void {
    Object.entries(expectedHeaders).forEach(([key, value]) => {
      expect(response.headers.get(key.toLowerCase())).toBe(value);
    });
  },
};

/**
 * Create request builder
 */
export function createRequest(url: string): RequestBuilder {
  return new RequestBuilder(url);
}

/**
 * HTTP utilities
 */
export const HttpUtils = {
  method: HttpMethod,
  headers: HeaderFactories,
  createRequest,
  assert: HttpAssertions,
  status: ErrorUtils.status,
};

export default HttpUtils;