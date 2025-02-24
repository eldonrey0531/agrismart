import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { appConfig } from '../config/app.config';
import { log } from '../utils/logger';
import { throwError } from './errors';

interface StorageConfig {
  s3?: {
    bucket: string;
    region: string;
    accessKey: string;
    secretKey: string;
  };
  local: {
    uploadDir: string;
    maxSize: number;
    allowedTypes: string[];
  };
}

const config: StorageConfig = {
  s3: appConfig.storage.s3,
  local: {
    uploadDir: path.join(process.cwd(), 'uploads'),
    maxSize: appConfig.upload.maxSize,
    allowedTypes: appConfig.upload.allowedTypes,
  },
};

class StorageService {
  private s3Client: S3Client | null = null;

  constructor() {
    if (config.s3) {
      this.s3Client = new S3Client({
        region: config.s3.region,
        credentials: {
          accessKeyId: config.s3.accessKey,
          secretAccessKey: config.s3.secretKey,
        },
      });
    }

    // Ensure local upload directory exists
    this.ensureUploadDir();
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(config.local.uploadDir);
    } catch {
      await fs.mkdir(config.local.uploadDir, { recursive: true });
    }
  }

  // Multer configuration for local storage
  public upload = multer({
    storage: multer.diskStorage({
      destination: config.local.uploadDir,
      filename: (_, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
      },
    }),
    limits: {
      fileSize: config.local.maxSize,
    },
    fileFilter: (_, file, cb) => {
      if (!config.local.allowedTypes.includes(file.mimetype)) {
        cb(new Error('File type not allowed'));
        return;
      }
      cb(null, true);
    },
  });

  async saveFile(file: Express.Multer.File): Promise<string> {
    try {
      if (this.s3Client) {
        return this.saveToS3(file);
      }
      return this.saveToLocal(file);
    } catch (error) {
      log.error('File upload failed', { error });
      throwError.server('File upload failed');
    }
  }

  private async saveToS3(file: Express.Multer.File): Promise<string> {
    if (!this.s3Client || !config.s3) {
      throwError.server('S3 not configured');
    }

    const key = `uploads/${Date.now()}-${file.originalname}`;
    
    await this.s3Client.send(new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    return key;
  }

  private async saveToLocal(file: Express.Multer.File): Promise<string> {
    const relativePath = path.relative(config.local.uploadDir, file.path);
    return relativePath;
  }

  async getFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      if (this.s3Client && config.s3) {
        const command = new GetObjectCommand({
          Bucket: config.s3.bucket,
          Key: key,
        });
        return getSignedUrl(this.s3Client, command, { expiresIn });
      }

      // For local storage, return the relative path
      return `/uploads/${key}`;
    } catch (error) {
      log.error('Error getting file URL', { error, key });
      throwError.server('Failed to get file URL');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      if (this.s3Client && config.s3) {
        await this.s3Client.send(new DeleteObjectCommand({
          Bucket: config.s3.bucket,
          Key: key,
        }));
      } else {
        const filePath = path.join(config.local.uploadDir, key);
        await fs.unlink(filePath);
      }
    } catch (error) {
      log.error('Error deleting file', { error, key });
      throwError.server('Failed to delete file');
    }
  }

  // Helper to get file metadata
  async getFileMetadata(key: string): Promise<{ size: number; type: string } | null> {
    try {
      if (this.s3Client && config.s3) {
        const command = new GetObjectCommand({
          Bucket: config.s3.bucket,
          Key: key,
        });
        const response = await this.s3Client.send(command);
        return {
          size: response.ContentLength || 0,
          type: response.ContentType || 'application/octet-stream',
        };
      }

      const filePath = path.join(config.local.uploadDir, key);
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        type: path.extname(key).slice(1),
      };
    } catch (error) {
      log.error('Error getting file metadata', { error, key });
      return null;
    }
  }
}

// Create singleton instance
export const storage = new StorageService();