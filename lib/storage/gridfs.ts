import mongoose, { Connection } from 'mongoose'
import { Readable } from 'stream'
import { createHash } from 'crypto'
import { connectDB } from '../db/client'

export type FilePurpose = 'avatar' | 'listing' | 'document' | 'chat'

export interface StorageFileMetadata {
  filename: string
  contentType: string
  userId?: string
  purpose?: FilePurpose
  size: number
  checksum: string
}

interface GridFSFile extends mongoose.mongo.GridFSFile {
  metadata: StorageFileMetadata
}

class GridFSStorage {
  private bucket: mongoose.mongo.GridFSBucket

  constructor(connection: Connection) {
    if (!connection.db) {
      throw new Error('Database connection not established')
    }
    this.bucket = new mongoose.mongo.GridFSBucket(connection.db, {
      bucketName: 'uploads'
    })
  }

  async uploadFile(
    buffer: Buffer,
    metadata: Omit<StorageFileMetadata, 'size' | 'checksum'>
  ): Promise<string> {
    // Ensure we're connected
    await connectDB()

    const checksum = createHash('md5')
      .update(buffer.toString('binary'), 'binary')
      .digest('hex')
    const size = buffer.length

    const uploadStream = this.bucket.openUploadStream(metadata.filename, {
      metadata: {
        ...metadata,
        size,
        checksum,
        uploadedAt: new Date()
      }
    })

    return new Promise((resolve, reject) => {
      const readableStream = new Readable()
      readableStream.push(buffer)
      readableStream.push(null)

      readableStream
        .pipe(uploadStream)
        .on('error', reject)
        .on('finish', () => resolve(uploadStream.id.toString()))
    })
  }

  async getFile(fileId: string): Promise<{
    stream: mongoose.mongo.GridFSBucketReadStream
    metadata: StorageFileMetadata
  }> {
    await connectDB()

    const files = await this.bucket
      .find({ _id: new mongoose.Types.ObjectId(fileId) })
      .toArray() as GridFSFile[]
    
    if (!files.length) {
      throw new Error('File not found')
    }

    const file = files[0]
    const stream = this.bucket.openDownloadStream(file._id)

    return {
      stream,
      metadata: {
        filename: file.filename,
        contentType: file.metadata.contentType,
        userId: file.metadata.userId,
        purpose: file.metadata.purpose,
        size: file.metadata.size,
        checksum: file.metadata.checksum
      }
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    await connectDB()
    await this.bucket.delete(new mongoose.Types.ObjectId(fileId))
  }

  async listFiles(query: Partial<StorageFileMetadata>): Promise<Array<StorageFileMetadata & { id: string }>> {
    await connectDB()

    const files = await this.bucket
      .find({ 'metadata': query })
      .toArray() as GridFSFile[]
    
    return files.map(file => ({
      id: file._id.toString(),
      filename: file.filename,
      contentType: file.metadata.contentType,
      userId: file.metadata.userId,
      purpose: file.metadata.purpose,
      size: file.metadata.size,
      checksum: file.metadata.checksum
    }))
  }

  async getFileMetadata(fileId: string): Promise<StorageFileMetadata> {
    await connectDB()

    const files = await this.bucket
      .find({ _id: new mongoose.Types.ObjectId(fileId) })
      .toArray() as GridFSFile[]
    
    if (!files.length) {
      throw new Error('File not found')
    }

    const file = files[0]
    return {
      filename: file.filename,
      contentType: file.metadata.contentType,
      userId: file.metadata.userId,
      purpose: file.metadata.purpose,
      size: file.metadata.size,
      checksum: file.metadata.checksum
    }
  }

  async fileExists(fileId: string): Promise<boolean> {
    await connectDB()
    const files = await this.bucket
      .find({ _id: new mongoose.Types.ObjectId(fileId) })
      .toArray()
    return files.length > 0
  }

  async getUserStorageUsage(userId: string): Promise<number> {
    await connectDB()
    const files = await this.bucket
      .find({ 'metadata.userId': userId })
      .toArray() as GridFSFile[]
    return files.reduce((total, file) => total + file.length, 0)
  }

  async createIndexes(): Promise<void> {
    await connectDB()
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not established')
    }

    await Promise.all([
      db.collection('uploads.files').createIndex({ 'metadata.userId': 1 }),
      db.collection('uploads.files').createIndex({ 'metadata.purpose': 1 }),
      db.collection('uploads.files').createIndex({ 'metadata.checksum': 1 }),
      db.collection('uploads.files').createIndex({ uploadDate: 1 })
    ])
  }
}

// Create and export singleton instance
const gridfs = new GridFSStorage(mongoose.connection)

export { gridfs }
export type { StorageFileMetadata as FileMetadata }