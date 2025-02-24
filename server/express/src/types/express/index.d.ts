import { Role, Status } from '../enums';

declare module 'express-serve-static-core' {
  interface Request {
    authenticatedUser?: {
      id: string;
      email: string;
      name: string;
      role: Role;
      status: Status;
    }
  }
}