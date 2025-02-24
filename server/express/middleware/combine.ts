import { Request, Response, NextFunction, RequestHandler } from "express";
import { AsyncRequestHandler } from "./asyncHandler";

type Middleware = RequestHandler | AsyncRequestHandler;

/**
 * Combine multiple middleware functions into a single middleware
 * @param middlewares Array of middleware functions to combine
 * @returns A single middleware function that executes all provided middlewares in sequence
 */
export function combineMiddleware(
  middlewares: Middleware[]
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (middlewares.length === 0) {
        return next();
      }

      let index = 0;
      const runMiddleware = async (): Promise<void> => {
        if (index >= middlewares.length) {
          return next();
        }

        const middleware = middlewares[index];
        index++;

        try {
          await new Promise<void>((resolve, reject) => {
            const result = middleware(req, res, (error?: any) => {
              if (error) {
                reject(error);
              } else {
                resolve();
              }
            });

            // Handle middleware that returns a promise
            if (result && typeof result.then === "function") {
              result.then(resolve).catch(reject);
            }
          });

          // If response is already sent, don't continue the chain
          if (!res.headersSent) {
            await runMiddleware();
          }
        } catch (error) {
          next(error);
        }
      };

      await runMiddleware();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Create a middleware chain that executes conditionally
 * @param condition Function that returns true if middleware should execute
 * @param middleware Middleware to execute conditionally
 * @returns Middleware function that only executes if condition is met
 */
export function conditionalMiddleware(
  condition: (req: Request) => boolean,
  middleware: Middleware | Middleware[]
): RequestHandler {
  const middlewareArray = Array.isArray(middleware) ? middleware : [middleware];
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (condition(req)) {
      const combinedMiddleware = combineMiddleware(middlewareArray);
      combinedMiddleware(req, res, next);
    } else {
      next();
    }
  };
}

/**
 * Create a middleware that skips execution in certain environments
 * @param middleware Middleware to execute
 * @param environments Array of environments where middleware should be skipped
 * @returns Middleware function that skips execution in specified environments
 */
export function skipInEnvironments(
  middleware: Middleware | Middleware[],
  environments: string[] = ["test"]
): RequestHandler {
  return conditionalMiddleware(
    () => !environments.includes(process.env.NODE_ENV || "development"),
    middleware
  );
}

/**
 * Create a middleware that only executes in certain environments
 * @param middleware Middleware to execute
 * @param environments Array of environments where middleware should execute
 * @returns Middleware function that only executes in specified environments
 */
export function onlyInEnvironments(
  middleware: Middleware | Middleware[],
  environments: string[] = ["development"]
): RequestHandler {
  return conditionalMiddleware(
    () => environments.includes(process.env.NODE_ENV || "development"),
    middleware
  );
}

export type { Middleware };

export default {
  combineMiddleware,
  conditionalMiddleware,
  skipInEnvironments,
  onlyInEnvironments,
};