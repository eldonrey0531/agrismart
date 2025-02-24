import { MongoClient, GridFSBucket } from 'mongodb'
import { randomUUID } from 'crypto'

interface FileMetadata {
  userId: string
  contentType: string
  filename: string
  size: number
  uploadDate: Date
  type: 'profile' | 'product' | 'attachment'
  thumbnails?: string[]
}

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]

const MAX_FILE_SIZE = {
  profile: 5 * 1024 * 1024, // 5MB
  product: 10 * 1024 * 1024, // 10MB
  attachment: 20 * 1024 * 1024 // 20MB
}

export class GridFSManager {
  private bucket: GridFSBucket | null = null
  private client: MongoClient | null = null

  constructor(private readonly dbUrl: string) {}

  async connect() {
    if (!this.client) {
      this.client = await MongoClient.connect(this.dbUrl)
      this.bucket = new GridFSBucket(this.client.db(), {
        bucketName: 'uploads'
      })
    }
    return this.bucket
  }

  async disconnect() {
    if (this.client) {
      await this.client.close()
      this.client = null
      this.bucket = null
    }
  }

  private async getBucket(): Promise<GridFSBucket> {
    if (!this.bucket) {
      await this.connect()
    }
    if (!this.bucket) {
      throw new Error('Failed to connect to GridFS')
    }
    return this.bucket
  }

  async uploadFile(
    buffer: Buffer,
    metadata: Omit<FileMetadata, 'uploadDate' | 'size'>
  ): Promise<string> {
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(metadata.contentType)) {
      throw new Error('Invalid file type')
    }

    // Validate file size
    if (buffer.length > MAX_FILE_SIZE[metadata.type]) {
      throw new Error(`File too large. Max size: ${MAX_FILE_SIZE[metadata.type] / 1024 / 1024}MB`)
    }

    const bucket = await this.getBucket()
    const fileId = randomUUID()

    return new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(metadata.filename, {
        metadata: {
          ...metadata,
          size: buffer.length,
          uploadDate: new Date(),
          fileId
        }
      })

      uploadStream.on('error', reject)
      uploadStream.on('finish', () => resolve(fileId))
      uploadStream.end(buffer)
    })
  }

  async getFile(fileId: string): Promise<{
    stream: NodeJS.ReadableStream
    metadata: FileMetadata
  }> {
    const bucket = await this.getBucket()
    const files = await bucket.find({ 'metadata.fileId': fileId }).toArray()

    if (!files.length) {
      throw new Error('File not found')
    }

    const file = files[0]
    return {
      stream: bucket.openDownloadStream(file._id),
      metadata: file.metadata as FileMetadata
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    const bucket = await this.getBucket()
    const files = await bucket.find({ 'metadata.fileId': fileId }).toArray()

    if (!files.length) {
      throw new Error('File not found')
    }

    await bucket.delete(files[0]._id)
  }

  async listFiles(query: Partial<FileMetadata>): Promise<FileMetadata[]> {
    const bucket = await this.getBucket()
    const files = await bucket
      .find({ metadata: { $matches: query } })
      .toArray()

    return files.map(file => file.metadata as FileMetadata)
  }

  async updateMetadata(
    fileId: string,
    metadata: Partial<FileMetadata>
  ): Promise<void> {
    const bucket = await this.getBucket()
    const files = await bucket.find({ 'metadata.fileId': fileId }).toArray()

    if (!files.length) {
      throw new Error('File not found')
    }

    await bucket.rename(files[0]._id, metadata.filename || files[0].filename)
  }
}

// Export singleton instance
export const gridFS = new GridFSManager(process.env.DATABASE_URL!)

// Export type
export type { FileMetadata }