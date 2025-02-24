export interface UploadedFile {
  /** Original file name */
  originalname: string;
  /** File encoding */
  encoding: string;
  /** File mimetype */
  mimetype: string;
  /** File size in bytes */
  size: number;
  /** File buffer */
  buffer: Buffer;
  /** File destination (if saved) */
  destination?: string;
  /** File name (if saved) */
  filename?: string;
  /** File path (if saved) */
  path?: string;
  /** Storage stream (if saved) */
  stream?: NodeJS.ReadableStream;
}