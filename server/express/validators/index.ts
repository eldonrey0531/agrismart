import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema, z } from "zod";
import { ValidationError } from "../utils/app-error";

export type RequestLocation = "body" | "query" | "params";

/**
 * Validates request data against a Zod schema
 * @param schema The Zod schema to validate against
 * @param location Where to look for data to validate ('body' | 'query' | 'params')
 */
export const validate = <T>(schema: ZodSchema<T>, location: RequestLocation = "body") => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = await schema.parseAsync(req[location]);
      // Replace the request data with the validated data
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

        next(new ValidationError("Validation failed", errors));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Validates multiple sources of request data
 * @param schemas Object containing schemas for different sources
 */
export const validateAll = (schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const promises = [];
      const errors: Record<string, string[]> = {};

      // Validate each source
      for (const [source, schema] of Object.entries(schemas)) {
        if (schema) {
          promises.push(
            schema
              .parseAsync(req[source as RequestLocation])
              .then((data) => {
                req[source as RequestLocation] = data;
              })
              .catch((error: ZodError) => {
                error.errors.forEach((err) => {
                  const path = `${source}.${err.path.join(".")}`;
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
      await Promise.all(promises);

      // If there were any validation errors, throw them
      if (Object.keys(errors).length > 0) {
        throw new ValidationError("Validation failed", errors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Sanitizes request data by removing unknown fields not in the schema
 * @param schema The Zod schema to validate against
 */
export const sanitize = <T extends z.ZodTypeAny>(schema: T) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Create a new schema that removes unknown fields
      const sanitizedSchema = schema instanceof z.ZodObject
        ? schema.strict()
        : schema;

      // Validate and sanitize the data
      const sanitizedData = await sanitizedSchema.parseAsync(req.body);
      req.body = sanitizedData;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Export validator functions
export default {
  validate,
  validateAll,
  sanitize,
};

// Export auth validators
export * from "./auth";

// Export chat validators
export * from "./chat";

// Export validator schemas
export { default as authValidators } from "./auth";
export { default as chatValidators } from "./chat";