import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Async handler type
 */
export type AsyncRequestHandler<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction
) => Promise<any>;

/**
 * Wrap async route handlers to catch errors
 */
export function asyncHandler<P = any, ResBody = any, ReqBody = any, ReqQuery = any>(
  handler: AsyncRequestHandler<P, ResBody, ReqBody, ReqQuery>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export default asyncHandler;