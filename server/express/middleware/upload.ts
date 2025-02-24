import multer from 'multer';
import { BadRequestError } from '../utils/app-error';

// Configure multer storage
const storage = multer.memoryStorage();

// Configure file filter
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only images
  if (!file.mimetype.startsWith('image/')) {
    cb(new BadRequestError('Only image files are allowed'));
    return;
  }

  // Accept specific image types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new BadRequestError('Invalid image format. Allowed formats: JPEG, PNG, WebP'));
    return;
  }

  cb(null, true);
};

// Configure limits
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
  files: 5 // Maximum 5 files per upload
};

// Create multer instance with configuration
export const upload = multer({
  storage,
  fileFilter,
  limits
});

// Helper function to validate file size
export const validateFileSize = (file: Express.Multer.File) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new BadRequestError(`File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
  }
};

// Helper function to validate image dimensions
export const validateImageDimensions = async (file: Express.Multer.File) => {
  // You can add image dimension validation here using sharp or another image processing library
  // For now, we'll skip this as it requires additional dependencies
  return true;
};

export default upload;