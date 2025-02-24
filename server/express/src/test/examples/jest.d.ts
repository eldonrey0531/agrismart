/// <reference types="jest" />

declare namespace jest {
  interface Matchers<R> {
    /**
     * Assert that the response is a successful response with optional data
     */
    toBeSuccessResponse<D = unknown>(data?: D): R;

    /**
     * Assert that the response is an error response with the given error details
     */
    toBeErrorResponse(error: {
      type: string;
      message: string;
      status: number;
    }): R;
  }
}