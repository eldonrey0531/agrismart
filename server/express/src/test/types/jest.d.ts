/// <reference types="jest" />

declare namespace jest {
  interface Matchers<R, T = any> {
    toBeSuccessResponse(data: unknown, status?: number): R;
    toBeErrorResponse(error: {
      status: number;
      type: string;
      message?: string;
    }): R;
    toHaveErrorType(type: string): R;
    toBeValidResponse(): R;
  }
}

export {};