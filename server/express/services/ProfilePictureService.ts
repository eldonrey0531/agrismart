import { gridfs } from '../utils/gridfs';
import { BadRequestError } from '../utils/app-error';
import { FileMetadata } from '../types/storage';
import { UploadedFile } from '../types/upload';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export class ProfilePictureService {
  /**
   * Upload profile picture
   */
  static async uploadProfilePicture(userId: string, file: UploadedFile): Promise<string> {
    // Validate file
    if (!file) {
      throw new BadRequestError('No file provided');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestError('Invalid file type. Only JPEG, PNG and WebP are allowed');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestError('File too large. Maximum size is 5MB');
    }

    // Delete existing profile picture if any
    const existingFiles = await gridfs.findFiles({ 
      userId, 
      purpose: 'profile-picture' as const
    });
    
    if (existingFiles.length > 0) {
      await Promise.all(existingFiles.map(file => 
        gridfs.deleteFile(file.id)
      ));
    }

    // Upload new profile picture
    const fileId = await gridfs.uploadFile(
      file.buffer,
      {
        filename: `profile-${userId}-${Date.now()}.${file.originalname.split('.').pop()}`,
        contentType: file.mimetype,
        userId,
        purpose: 'profile-picture' as const
      }
    );

    return fileId;
  }

  /**
   * Get profile picture
   */
  static async getProfilePicture(userId: string) {
    const files = await gridfs.findFiles({ 
      userId, 
      purpose: 'profile-picture' as const
    });

    if (files.length === 0) {
      return null;
    }

    return gridfs.getFile(files[0].id);
  }

  /**
   * Delete profile picture
   */
  static async deleteProfilePicture(userId: string): Promise<void> {
    const files = await gridfs.findFiles({ 
      userId, 
      purpose: 'profile-picture' as const
    });

    await Promise.all(files.map(file => 
      gridfs.deleteFile(file.id)
    ));
  }
}