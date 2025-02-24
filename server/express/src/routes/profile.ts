import express from 'express';
import { RequestHandler } from '../types';

const router = express.Router();

const getProfile: RequestHandler<any> = async (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Profile endpoints coming soon'
    }
  });
};

router.get('/', getProfile);

export default router;