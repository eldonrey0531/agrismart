import { Request } from 'express';
import { Types } from 'mongoose';
import type { TestUser } from './types';

// Extend Express Request for our custom properties
interface CustomRequest extends Request {
  user?: TestUser | null;
  session?: Record<string, any> & {
    save?: (cb: () => void) => void;
  };
  files?: any[];
}

interface MockRequestOptions {
  method?: string;
  url?: string;
  params?: Record<string, any>;
  query?: Record<string, any>;
  body?: Record<string, any>;
  headers?: Record<string, string | string[]>;
  user?: TestUser | null;
  session?: Record<string, any>;
  cookies?: Record<string, string>;
  ip?: string;
  files?: any[];
  [key: string]: any;
}

// Type for header getter functions
interface HeaderGetter {
  (name: 'set-cookie'): string[] | undefined;
  (name: string): string | undefined;
}

/**
 * Creates a mock Express request object for testing
 */
export function createMockRequest(options: MockRequestOptions = {}): Partial<CustomRequest> {
  const {
    method = 'GET',
    url = '/',
    params = {},
    query = {},
    body = {},
    headers: customHeaders = {},
    user = null,
    session = {},
    cookies = {},
    ip = '127.0.0.1',
    files = [],
    ...rest
  } = options;

  const headers: Record<string, string | string[]> = {
    'content-type': 'application/json',
    'user-agent': 'jest-test',
    ...customHeaders,
  };

  const get: HeaderGetter = ((name: string): string | string[] | undefined => {
    const headerName = name.toLowerCase();
    const value = headers[headerName];
    if (headerName === 'set-cookie') {
      return Array.isArray(value) ? value : value ? [value] : undefined;
    }
    return typeof value === 'string' ? value : Array.isArray(value) ? value[0] : undefined;
  }) as HeaderGetter;

  const header: HeaderGetter = get;

  return {
    method,
    url,
    params,
    query,
    body,
    headers,
    user,
    session,
    cookies,
    ip,
    files,
    get,
    header,
    ...rest,
  };
}

/**
 * Creates a mock authenticated request with a user
 */
export function createAuthenticatedRequest(
  user: Partial<TestUser> = {},
  options: MockRequestOptions = {}
): Partial<CustomRequest> {
  const defaultUser: TestUser = {
    _id: new Types.ObjectId(),
    email: `user-${Date.now()}@test.com`,
    password: 'password123',
    name: 'Test User',
    role: 'user',
    status: 'active',
    verified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...user,
  };

  return createMockRequest({
    ...options,
    user: defaultUser,
    headers: {
      authorization: `Bearer test-token`,
      ...options.headers,
    },
  });
}

/**
 * Creates a mock admin request
 */
export function createAdminRequest(
  override: Partial<TestUser> = {},
  options: MockRequestOptions = {}
): Partial<CustomRequest> {
  return createAuthenticatedRequest(
    {
      role: 'admin',
      ...override,
    },
    options
  );
}

/**
 * Creates a mock seller request
 */
export function createSellerRequest(
  override: Partial<TestUser> = {},
  options: MockRequestOptions = {}
): Partial<CustomRequest> {
  return createAuthenticatedRequest(
    {
      role: 'seller',
      ...override,
    },
    options
  );
}

/**
 * Creates a mock file upload request
 */
export function createFileUploadRequest(
  files: any[],
  options: MockRequestOptions = {}
): Partial<CustomRequest> {
  return createMockRequest({
    ...options,
    files,
    headers: {
      'content-type': 'multipart/form-data',
      ...options.headers,
    },
  });
}

/**
 * Creates a mock request with specified session data
 */
export function createSessionRequest(
  sessionData: Record<string, any>,
  options: MockRequestOptions = {}
): Partial<CustomRequest> {
  return createMockRequest({
    ...options,
    session: {
      ...sessionData,
      save: vi.fn().mockImplementation((cb: () => void) => cb()),
    },
  });
}

export default {
  createMockRequest,
  createAuthenticatedRequest,
  createAdminRequest,
  createSellerRequest,
  createFileUploadRequest,
  createSessionRequest,
};