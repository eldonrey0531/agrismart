import { User } from '@prisma/client';
import { Request as ExpressRequest } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';

declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        name?: string;
      };
      requestId?: string;
      startTime?: number;
      body: any;
      query: Query;
      params: ParamsDictionary;
      files?: {
        [fieldname: string]: Express.Multer.File[];
      } | Express.Multer.File[];
      file?: Express.Multer.File;
    }

    export interface Response {
      locals: {
        user?: User;
        requestId?: string;
        [key: string]: any;
      };
    }

    namespace Multer {
      interface File {
        /** Field name specified in the form */
        fieldname: string;
        /** Name of the file on the user's computer */
        originalname: string;
        /** Encoding type of the file */
        encoding: string;
        /** Mime type of the file */
        mimetype: string;
        /** Size of the file in bytes */
        size: number;
        /** The folder to which the file has been saved */
        destination: string;
        /** The name of the file within the destination */
        filename: string;
        /** Location of the uploaded file */
        path: string;
        /** A Buffer of the entire file */
        buffer: Buffer;
        /** Custom file URL after upload */
        url?: string;
        /** Storage reference key */
        key?: string;
      }
    }
  }
}

// Custom request types
export interface TypedRequest<
  TBody = any,
  TQuery = any,
  TParams = any
> extends Omit<ExpressRequest, 'body' | 'query' | 'params'> {
  body: TBody;
  query: TQuery;
  params: TParams;
}

// Auth-related request types
export interface AuthRequest extends ExpressRequest {
  user: {
    id: string;
    email: string;
    role: string;
    name?: string;
  };
}

export interface FileRequest extends ExpressRequest {
  file: Express.Multer.File;
}

export interface FilesRequest extends ExpressRequest {
  files: {
    [fieldname: string]: Express.Multer.File[];
  } | Express.Multer.File[];
}

// Combined request types
export interface AuthFileRequest extends AuthRequest {
  file: Express.Multer.File;
}

export interface AuthFilesRequest extends AuthRequest {
  files: {
    [fieldname: string]: Express.Multer.File[];
  } | Express.Multer.File[];
}

// Utility types
export type RequestHandler<
  TBody = any,
  TQuery = any,
  TParams = any
> = (
  req: TypedRequest<TBody, TQuery, TParams>,
  res: Express.Response,
  next: (error?: any) => void
) => void | Promise<void>;

export type FileRequestHandler = (
  req: FileRequest,
  res: Express.Response,
  next: (error?: any) => void
) => void | Promise<void>;

export type AuthRequestHandler = (
  req: AuthRequest,
  res: Express.Response,
  next: (error?: any) => void
) => void | Promise<void>;

export type ErrorRequestHandler = (
  error: any,
  req: ExpressRequest,
  res: Express.Response,
  next: (error?: any) => void
) => void;

// Extend Express Request interface
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: string;
      name?: string;
    };
    requestId?: string;
    startTime?: number;
  }
}

export {
  Express,
  TypedRequest,
  AuthRequest,
  FileRequest,
  FilesRequest,
  AuthFileRequest,
  AuthFilesRequest,
  RequestHandler,
  FileRequestHandler,
  AuthRequestHandler,
  ErrorRequestHandler
};