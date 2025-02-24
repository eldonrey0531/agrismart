import type { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from './types';

/**
 * Response type guards
 */
export const isSuccessResponse = <T = unknown>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> => response.success;

export const isErrorResponse = (
  response: ApiResponse
): response is ApiErrorResponse => !response.success;

/**
 * Response assertions
 */
export function assertSuccessResponse<T = unknown>(
  data: ApiResponse<T>
): asserts data is ApiSuccessResponse<T> {
  if (!isSuccessResponse(data)) {
    throw new Error(
      `Expected success response, got error: ${
        isErrorResponse(data) ? data.message : 'Unknown error'
      }`
    );
  }
}

export function assertErrorResponse(
  data: ApiResponse
): asserts data is ApiErrorResponse {
  if (!isErrorResponse(data)) {
    throw new Error(
      `Expected error response, got success with data: ${JSON.stringify(data.data)}`
    );
  }
}

/**
 * Response expectations
 */
export const expectSuccess = async <T = unknown>(
  response: Response,
  expectedData?: T,
  status = 200
): Promise<ApiSuccessResponse<T>> => {
  expect(response.status).toBe(status);
  expect(response.ok).toBe(true);

  const data = await response.json() as ApiResponse<T>;
  assertSuccessResponse(data);

  if (expectedData !== undefined) {
    expect(data.data).toEqual(expectedData);
  }

  return data;
};

export const expectError = async (
  response: Response,
  {
    status,
    type,
    message,
  }: {
    status: number;
    type: string;
    message?: string;
  }
): Promise<ApiErrorResponse> => {
  expect(response.status).toBe(status);
  expect(response.ok).toBe(false);

  const data = await response.json() as ApiResponse;
  assertErrorResponse(data);

  expect(data.type).toBe(type);
  if (message) {
    expect(data.message).toBe(message);
  }

  return data;
};

/**
 * Response validation
 */
export const validateResponse = {
  success: <T = unknown>(response: Response, expectedData?: T, status = 200) =>
    expectSuccess(response, expectedData, status),

  error: (
    response: Response,
    { status, type, message }: { status: number; type: string; message?: string }
  ) => expectError(response, { status, type, message }),

  networkError: async (promise: Promise<Response>, errorMessage?: string) => {
    await expect(promise).rejects.toThrow(errorMessage);
  },
};

export const assertions = {
  isSuccessResponse,
  isErrorResponse,
  assertSuccessResponse,
  assertErrorResponse,
  expectSuccess,
  expectError,
  validateResponse,
};

export default assertions;