import { AuthenticatedUser } from './user';

// This allows us to add custom properties to Express.Request
declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
  }
}