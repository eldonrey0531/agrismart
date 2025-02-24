import { Express } from 'express';
import { Storage } from '@google-cloud/storage';
import { BadRequestError } from '../utils/app-error';
import crypto from 'crypto';

const storage = new Storage();
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'default-bucket');

export class FileStorageService {
  /**
   * Upload multiple images to cloud storage
   */
  static async uploadImages(
    files: Express.Multer.File[],
    userId: string,
    type: string
  ): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => this.uploadSingleFile(file, userId, type));
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new BadRequestError('Failed to upload images');
    }
  }

  /**
   * Upload a single file to cloud storage
   */
  private static async uploadSingleFile(
    file: Express.Multer.File,
    userId: string,
    type: string
  ): Promise<string> {
    // Generate unique filename
    const fileExtension = file.originalname.split('.').pop();
    const randomName = crypto.randomBytes(16).toString('hex');
    const filename = `${type}/${userId}/${randomName}.${fileExtension}`;

    const blob = bucket.file(filename);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype,
        metadata: {
          userId,
          originalName: file.originalname,
          uploadedAt: new Date().toISOString()
        }
      }
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (error) => {
        reject(error);
      });

      blobStream.on('finish', () => {
        resolve(filename);
      });

      blobStream.end(file.buffer);
    });
  }

  /**
   * Delete a file from cloud storage
   */
  static async deleteFile(filename: string): Promise<void> {
    try {
      await bucket.file(filename).delete();
    } catch (error) {
      throw new BadRequestError('Failed to delete file');
    }
  }

  /**
   * Generate signed URL for file download
   */
  static async getSignedUrl(filename: string): Promise<string> {
    try {
      const [url] = await bucket.file(filename).getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000 // 15 minutes
      });
      return url;
    } catch (error) {
      throw new BadRequestError('Failed to generate signed URL');
    }
  }
}