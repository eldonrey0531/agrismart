import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponseSchema } from "./schemas";
import { VALIDATION_VERSION } from "./common";
import type { NextRequest } from "next/server";

export interface ValidationMiddlewareOptions {
  responseValidation?: z.ZodType;
  removeUnknown?: boolean;
}

/**
 * Creates a validation middleware that validates both request and response
 * @param schema Request validation schema
 * @param options Middleware options
 */
export function createValidationMiddleware(
  schema: z.ZodType,
  options: ValidationMiddlewareOptions = {}
) {
  return async function validationMiddleware(
    request: NextRequest,
    next: () => Promise<NextResponse>
  ) {
    try {
      // Parse request body
      const body = await request.json();

      // Validate request data
      const validatedData = await schema.parseAsync(body, {
        errorMap: (error) => ({
          message: error.message || "Invalid input",
        }),
      });

      // Replace request body with validated data
      const validatedRequest = new Request(request.url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(validatedData),
      });

      // Call next middleware/handler
      const response = await next();

      // Validate response if schema provided
      if (options.responseValidation) {
        const responseData = await response.json();
        const validatedResponse = await options.responseValidation.parseAsync(
          responseData
        );

        // Return validated response with version header
        return new NextResponse(JSON.stringify(validatedResponse), {
          headers: {
            "Content-Type": "application/json",
            "X-Validation-Version": VALIDATION_VERSION,
          },
          status: response.status,
        });
      }

      return response;
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        const errorResponse = errorResponseSchema.parse({
          error: {
            code: "VALIDATION_ERROR",
            message: "Request validation failed",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
        });

        return new NextResponse(JSON.stringify(errorResponse), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "X-Validation-Version": VALIDATION_VERSION,
          },
        });
      }

      // Handle other errors
      const errorResponse = errorResponseSchema.parse({
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      });

      return new NextResponse(JSON.stringify(errorResponse), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "X-Validation-Version": VALIDATION_VERSION,
        },
      });
    }
  };
}

/**
 * Helper function to compose multiple validation middlewares
 * @param middlewares Array of validation middlewares to compose
 */
export function composeValidation(...middlewares: Array<(req: NextRequest, next: () => Promise<NextResponse>) => Promise<NextResponse>>) {
  return async function composedMiddleware(request: NextRequest) {
    let index = -1;

    async function dispatch(i: number): Promise<NextResponse> {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      const middleware = middlewares[i];

      if (i === middlewares.length) {
        throw new Error("No more middlewares to execute");
      }

      return middleware(request, () => dispatch(i + 1));
    }

    return dispatch(0);
  };
}