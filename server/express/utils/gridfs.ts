import mongoose from 'mongoose';
import { createHash } from 'crypto';
import { FileMetadata, FileQuery, FileStream, StoredFile } from '../types/storage';

export class GridFSStorage {
  private bucket: mongoose.mongo.GridFSBucket;

  constructor() {
    if (!mongoose.connection.db) {
      throw new Error('Database connection not initialized');
    }
    this.bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });
  }

  async uploadFile(buffer: Buffer, metadata: Omit<FileMetadata, 'size' | 'uploadedAt'>): Promise<string> {
    const checksum = createHash('md5').update(buffer).digest('hex');
    
    return new Promise((resolve, reject) => {
      const uploadStream = this.bucket.openUploadStream(metadata.filename, {
        metadata: {
          ...metadata,
          checksum,
          size: buffer.length,
          uploadedAt: new Date()
        }
      });

      uploadStream.on('error', reject);
      uploadStream.on('finish', () => resolve(uploadStream.id.toString()));
      uploadStream.end(buffer);
    });
  }

  async findFiles(query: FileQuery): Promise<StoredFile[]> {
    const files = await this.bucket
      .find({ 'metadata': query })
      .toArray();

    return files.map(file => ({
      id: file._id.toString(),
      filename: file.filename,
      contentType: file.metadata?.contentType || 'application/octet-stream',
      userId: file.metadata?.userId || '',
      purpose: file.metadata?.purpose || 'attachment',
      size: file.length,
      checksum: file.metadata?.checksum,
      uploadedAt: file.uploadDate
    }));
  }

  async getFile(fileId: string): Promise<FileStream> {
    const files = await this.bucket
      .find({ _id: new mongoose.Types.ObjectId(fileId) })
      .toArray();

    if (!files.length) {
      throw new Error('File not found');
    }

    const file = files[0];
    if (!file.metadata) {
      throw new Error('File metadata not found');
    }

    return {
      stream: this.bucket.openDownloadStream(file._id),
      metadata: file.metadata as FileMetadata
    };
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.bucket.delete(new mongoose.Types.ObjectId(fileId));
  }
}

// Create singleton instance
export const gridfs = new GridFSStorage();