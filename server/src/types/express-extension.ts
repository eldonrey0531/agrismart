import { Request, Response } from 'express';
import { User } from '@prisma/client';

// Typed request interfaces
export interface TypedRequest<
  TBody = any,
  TQuery = any,
  TParams = any
> extends Request {
  body: TBody;
  query: TQuery;
  params: TParams;
  user?: AuthUser;
}

export interface TypedResponse<T = any> extends Response {
  json(data: T): this;
}

// Auth user type
export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name?: string;
}

// Authenticated request
export interface RequestWithAuth extends Request {
  user: AuthUser;
}

// File request types
export interface FileWithUrl {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
  url?: string;
  key?: string;
}

export interface RequestWithFile extends Request {
  file?: FileWithUrl;
}

export interface RequestWithFiles extends Request {
  files?: FileWithUrl[];
}

// Combined request types
export interface RequestWithFileAndAuth extends RequestWithAuth {
  file?: FileWithUrl;
}

export interface RequestWithFilesAndAuth extends RequestWithAuth {
  files?: FileWithUrl[];
}

// Handler types
export interface RequestHandler<
  TBody = any,
  TQuery = any,
  TParams = any,
  TResponse = any
> {
  (
    req: TypedRequest<TBody, TQuery, TParams>,
    res: TypedResponse<TResponse>,
    next: (error?: any) => void
  ): void | Promise<void>;
}

export interface FileHandler {
  (
    req: RequestWithFile,
    res: Response,
    next: (error?: any) => void
  ): void | Promise<void>;
}

export interface AuthHandler {
  (
    req: RequestWithAuth,
    res: Response,
    next: (error?: any) => void
  ): void | Promise<void>;
}

export interface FileAuthHandler {
  (
    req: RequestWithFileAndAuth,
    res: Response,
    next: (error?: any) => void
  ): void | Promise<void>;
}

// Response locals
export interface ResponseWithLocals extends Response {
  locals: {
    user?: User;
    [key: string]: any;
  };
}

// Multer types
export interface MulterExt {
  single(fieldname: string): any;
  array(fieldname: string, maxCount?: number): any;
  fields(fields: Array<{ name: string; maxCount?: number }>): any;
  none(): any;
}

// Error types
export interface MulterError extends Error {
  code: string;
  field?: string;
}

export interface StorageEngine {
  _handleFile: (req: Request, file: FileWithUrl, callback: (error?: any, info?: Partial<FileWithUrl>) => void) => void;
  _removeFile: (req: Request, file: FileWithUrl, callback: (error: Error) => void) => void;
}

// Type assertion utilities
export function isAuthRequest(req: Request): req is RequestWithAuth {
  return 'user' in req;
}

export function isFileRequest(req: Request): req is RequestWithFile {
  return 'file' in req;
}

export function isFilesRequest(req: Request): req is RequestWithFiles {
  return 'files' in req;
}

export function isFileAuthRequest(req: Request): req is RequestWithFileAndAuth {
  return isAuthRequest(req) && isFileRequest(req);
}

export function isFilesAuthRequest(req: Request): req is RequestWithFilesAndAuth {
  return isAuthRequest(req) && isFilesRequest(req);
}