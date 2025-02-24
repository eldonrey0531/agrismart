import { Router } from 'express';
import multer from 'multer';
import { ProfilePictureService } from '../services/ProfilePictureService';
import { BadRequestError } from '../utils/app-error';
import { auth } from '../middleware/auth';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Upload profile picture
router.post(
  '/picture',
  auth,
  upload.single('picture'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        throw new BadRequestError('No file uploaded');
      }

      const fileId = await ProfilePictureService.uploadProfilePicture(
        req.user!.id,
        req.file
      );

      res.json({
        success: true,
        fileId
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get profile picture
router.get(
  '/picture',
  auth,
  async (req, res, next) => {
    try {
      const file = await ProfilePictureService.getProfilePicture(req.user!.id);
      
      if (!file) {
        res.status(404).json({
          success: false,
          message: 'No profile picture found'
        });
        return;
      }

      res.set('Content-Type', file.metadata.contentType);
      file.stream.pipe(res);
    } catch (error) {
      next(error);
    }
  }
);

// Delete profile picture
router.delete(
  '/picture',
  auth,
  async (req, res, next) => {
    try {
      await ProfilePictureService.deleteProfilePicture(req.user!.id);
      
      res.json({
        success: true,
        message: 'Profile picture deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as profileRouter };