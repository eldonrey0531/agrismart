import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';
import { appConfig } from '../config/app.config';
import { throwError } from '../lib/errors';
import { v4 as uuidv4 } from 'uuid';
import { UploadedFile, FileUploadOptions } from '../types/multer';

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, appConfig.storage.local.uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Default upload options
const defaultOptions: FileUploadOptions = {
  limits: {
    fileSize: appConfig.upload.maxSize,
    files: 5
  },
  allowedMimeTypes: appConfig.upload.allowedTypes
};

// File filter function
const fileFilter = (allowedTypes: string[]) => {
  return (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  };
};

// Create multer instance with options
export const createUploader = (options: Partial<FileUploadOptions> = {}) => {
  const uploadOptions: FileUploadOptions = {
    ...defaultOptions,
    ...options,
    storage,
    fileFilter: fileFilter(options.allowedMimeTypes || defaultOptions.allowedMimeTypes!)
  };

  return multer(uploadOptions);
};

// Error handling middleware for multer
export const handleUploadError = (err: any, req: Request, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      throwError.badRequest('File size exceeds the limit');
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      throwError.badRequest('Too many files');
    }
    throwError.badRequest(err.message);
  }

  if (err.message.includes('File type')) {
    throwError.badRequest(err.message);
  }

  next(err);
};

// Common upload configurations
export const uploads = {
  // Single file upload
  single: (fieldName: string, options?: Partial<FileUploadOptions>) => {
    const uploader = createUploader(options);
    return [uploader.single(fieldName), handleUploadError];
  },

  // Multiple files upload
  array: (fieldName: string, maxCount: number, options?: Partial<FileUploadOptions>) => {
    const uploader = createUploader(options);
    return [uploader.array(fieldName, maxCount), handleUploadError];
  },

  // Multiple fields with files
  fields: (fields: { name: string; maxCount: number }[], options?: Partial<FileUploadOptions>) => {
    const uploader = createUploader(options);
    return [uploader.fields(fields), handleUploadError];
  },

  // Profile image upload with specific configuration
  profileImage: [
    createUploader({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1
      },
      allowedMimeTypes: ['image/jpeg', 'image/png']
    }).single('avatar'),
    handleUploadError
  ],

  // Product images upload
  productImages: [
    createUploader({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 5
      },
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    }).array('images', 5),
    handleUploadError
  ],

  // Document upload
  documents: [
    createUploader({
      limits: {
        fileSize: 15 * 1024 * 1024, // 15MB
        files: 3
      },
      allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    }).array('documents', 3),
    handleUploadError
  ]
};

// Helper functions for file operations
export const fileUtils = {
  getFileExtension: (filename: string): string => {
    return path.extname(filename).toLowerCase();
  },

  generateFileName: (originalname: string): string => {
    const ext = path.extname(originalname);
    return `${uuidv4()}${ext}`;
  },

  isAllowedType: (mimetype: string): boolean => {
    return defaultOptions.allowedMimeTypes!.includes(mimetype);
  },

  getFileSize: (file: Express.Multer.File): number => {
    return file.size;
  }
};