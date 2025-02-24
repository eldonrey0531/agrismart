import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError, z } from "zod";
import { ValidationError } from "../utils/app-error";
import { asyncHandler } from "./asyncHandler";

export type RequestLocation = "body" | "query" | "params";

export interface ValidatorOptions {
  location?: RequestLocation;
}

/**
 * Creates a validation middleware using a Zod schema
 */
export const validate = <T>(
  schema: ZodSchema<T>,
  locationOrOptions: RequestLocation | ValidatorOptions = "body"
) => {
  const options: ValidatorOptions = 
    typeof locationOrOptions === "string" 
      ? { location: locationOrOptions }
      : locationOrOptions;

  const { location = "body" } = options;

  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = await schema.parseAsync(req[location]);
      req[location] = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.reduce((acc, curr) => {
          const path = curr.path.join(".");
          if (!acc[path]) {
            acc[path] = [];
          }
          acc[path].push(curr.message);
          return acc;
        }, {} as Record<string, string[]>);

        throw new ValidationError("Validation failed", errors);
      }
      throw error;
    }
  });
};

/**
 * Validates multiple request locations
 */
export const validateAll = (schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const errors: Record<string, string[]> = {};
    const validations: Promise<void>[] = [];

    // Validate each location
    for (const [location, schema] of Object.entries(schemas)) {
      if (schema) {
        validations.push(
          schema
            .parseAsync(req[location as RequestLocation])
            .then((data) => {
              req[location as RequestLocation] = data;
            })
            .catch((error: ZodError) => {
              error.errors.forEach((err) => {
                const path = `${location}.${err.path.join(".")}`;
                if (!errors[path]) {
                  errors[path] = [];
                }
                errors[path].push(err.message);
              });
            })
        );
      }
    }

    // Wait for all validations to complete
    await Promise.all(validations);

    // If there were any validation errors, throw them
    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Validation failed", errors);
    }

    next();
  });
};

/**
 * Creates a schema that transforms string numbers in query parameters
 */
export const createQuerySchema = <T extends z.ZodRawShape>(shape: T) => {
  return z.object(shape).transform((data) => {
    const result = { ...data };
    for (const [key, value] of Object.entries(result)) {
      if (typeof value === "string" && /^\d+$/.test(value)) {
        (result as any)[key] = parseInt(value, 10);
      }
    }
    return result;
  });
};

/**
 * Validates and transforms query parameters
 */
export const validateQuery = <T extends z.ZodRawShape>(shape: T) => {
  const schema = createQuerySchema(shape);
  return validate(schema, "query");
};

/**
 * Creates a schema for pagination parameters
 */
export const createPaginationSchema = () => {
  return createQuerySchema({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    sort: z.string().optional(),
    order: z.enum(["asc", "desc"]).optional(),
  });
};

export default {
  validate,
  validateAll,
  validateQuery,
  createQuerySchema,
  createPaginationSchema,
};
