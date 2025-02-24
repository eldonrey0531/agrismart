import { Request, Response, NextFunction } from 'express';

/**
 * Configure proper JSON response formatting
 */
const jsonResponse = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Set JSON formatting options
  res.app.set('json spaces', 2);
  res.app.set('json replacer', (_: string, value: unknown) => {
    return value === undefined ? null : value;
  });

  // Store original json method
  const originalJson = res.json;

  // Override json method
  res.json = function (body: unknown) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return originalJson.call(this, body);
  };

  next();
};

export default jsonResponse;
