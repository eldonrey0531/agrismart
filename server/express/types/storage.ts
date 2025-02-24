export type FilePurpose = 
  | 'profile-picture'
  | 'product-image'
  | 'product-thumbnail'
  | 'attachment'
  | 'product-image-thumbnail'
  | 'marketplace-image'
  | 'marketplace-thumbnail';

export interface ThumbnailMetadata {
  small?: string;
  medium?: string;
  large?: string;
}

export interface FileMetadata {
  filename: string;
  contentType: string;
  userId: string;
  purpose: FilePurpose;
  size?: number;
  checksum?: string;
  uploadedAt?: Date;
  thumbnails?: ThumbnailMetadata;
  originalFileId?: string; // For thumbnails, reference to original file
  optimized?: boolean;
  width?: number;
  height?: number;
}

export interface StoredFile {
  id: string;
  filename: string;
  contentType: string;
  userId: string;
  purpose: FilePurpose;
  size: number;
  checksum?: string;
  uploadedAt: Date;
  metadata: FileMetadata;
}

export interface FileQuery {
  userId?: string;
  purpose?: FilePurpose;
  filename?: string;
  contentType?: string;
  originalFileId?: string;
}

export interface FileStream {
  stream: NodeJS.ReadableStream;
  metadata: FileMetadata;
}