import { z } from "zod";
import { errorResponseSchema, productSchema, locationSchema, categorySchema } from "./schemas";

/**
 * API request validation wrapper - ensures consistent validation 
 * between frontend and backend
 */
export async function validateApiRequest<T extends z.ZodType>(
  data: unknown,
  schema: T
): Promise<z.infer<T>> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw {
        status: 400,
        body: errorResponseSchema.parse({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
        }),
      };
    }
    throw error;
  }
}

/**
 * Frontend validation helper - ensures same validation as backend
 */
export async function validateFormData<T extends z.ZodType>(
  data: unknown,
  schema: T
): Promise<{
  success: boolean;
  data?: z.infer<T>;
  errors?: { field: string; message: string }[];
}> {
  try {
    const validData = await schema.parseAsync(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      };
    }
    throw error;
  }
}

/**
 * Type-safe API endpoint builder with validation
 */
export function createEndpoint<T extends z.ZodType>(config: {
  schema: T;
  handler: (data: z.infer<T>) => Promise<unknown>;
}) {
  return async function endpointHandler(request: Request) {
    try {
      const body = await request.json();
      const validatedData = await validateApiRequest(body, config.schema);
      const result = await config.handler(validatedData);
      
      return new Response(JSON.stringify({ data: result }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error: any) {
      if (error?.status && error?.body) {
        return new Response(JSON.stringify(error.body), {
          status: error.status,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      return new Response(
        JSON.stringify({
          error: {
            code: "INTERNAL_ERROR",
            message: "An unexpected error occurred",
          },
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  };
}

// Example product endpoint with validation
export const createProductEndpoint = createEndpoint({
  schema: productSchema,
  handler: async (data) => {
    // Handler implementation
    return { id: "123", ...data };
  },
});

// Example usage in an API route
/*
// app/api/products/route.ts
import { createProductEndpoint } from "@/lib/validations/api-helpers";

export const POST = createProductEndpoint;
*/