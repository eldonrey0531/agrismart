declare namespace Express {
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
    }

    interface Options {
      /** The destination directory for the uploaded files */
      dest?: string;
      /** The storage engine to use */
      storage?: any;
      /** An object specifying the size limits of the following optional properties */
      limits?: {
        /** Max field name size (in bytes) */
        fieldNameSize?: number;
        /** Max field value size (in bytes) */
        fieldSize?: number;
        /** Max number of non-file fields */
        fields?: number;
        /** Max file size (in bytes) */
        fileSize?: number;
        /** Max number of file fields */
        files?: number;
        /** Max number of parts (fields + files) */
        parts?: number;
        /** Max number of headers */
        headerPairs?: number;
      };
      /** Keep the full path of files instead of just the base name */
      preservePath?: boolean;
      /** Function to control which files are uploaded */
      fileFilter?(
        req: Express.Request,
        file: Multer.File,
        callback: (error: Error | null, acceptFile: boolean) => void
      ): void;
    }

    interface Field {
      /** The field name */
      name: string;
      /** Optional maximum number of files per field */
      maxCount?: number;
    }

    interface Instance {
      /** Accept a single file with the name fieldname */
      single(fieldname: string): any;
      /** Accept an array of files, all with the name fieldname */
      array(fieldname: string, maxCount?: number): any;
      /** Accept multiple files, with different field names */
      fields(fields: Field[]): any;
      /** Accept only specified number of files, stored in an array */
      any(): any;
      /** Accept multiple files, with different field names */
      none(): any;
    }
  }
}

declare module 'multer' {
  import { Request, Response } from 'express';

  namespace multer {
    interface StorageEngine {
      _handleFile(
        req: Request,
        file: Express.Multer.File,
        callback: (error?: any, info?: Partial<Express.Multer.File>) => void
      ): void;
      _removeFile(
        req: Request,
        file: Express.Multer.File,
        callback: (error: Error) => void
      ): void;
    }

    interface DiskStorageOptions {
      /** A function that determines within which folder the uploaded files should be stored. */
      destination?: string | ((
        req: Request,
        file: Express.Multer.File,
        callback: (error: Error | null, destination: string) => void
      ) => void);
      /** A function that determines what the file should be named inside the folder. */
      filename?(
        req: Request,
        file: Express.Multer.File,
        callback: (error: Error | null, filename: string) => void
      ): void;
    }

    interface Instance {
      /** In case you need to handle a text-only multipart form */
      none(): any;
      /** Accept a single file with the name fieldname */
      single(fieldname: string): any;
      /** Accept an array of files, all with the name fieldname */
      array(fieldname: string, maxCount?: number): any;
      /** Accept multiple files, with different field names */
      fields(fields: Express.Multer.Field[]): any;
      /** Accept only specified number of files, stored in an array */
      any(): any;
    }
  }

  interface Multer {
    (options?: Express.Multer.Options): Express.Multer.Instance;
    diskStorage(options: multer.DiskStorageOptions): multer.StorageEngine;
    memoryStorage(): multer.StorageEngine;
  }

  const multer: Multer;
  export = multer;
}

// Additional custom types for our application
export interface UploadedFile extends Express.Multer.File {
  url?: string;
  key?: string;
  bucket?: string;
}

export interface FileUploadOptions extends Express.Multer.Options {
  allowedMimeTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  generateUniqueName?: boolean;
  resizeOptions?: {
    width?: number;
    height?: number;
    quality?: number;
  };
}

export interface FileUploadResult {
  file: UploadedFile;
  url: string;
  key: string;
  success: boolean;
  error?: string;
}