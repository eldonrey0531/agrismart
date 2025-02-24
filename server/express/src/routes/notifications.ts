import express from 'express';
import { RequestHandler } from '../types';

const router = express.Router();

const getNotifications: RequestHandler<any> = async (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Notifications endpoints coming soon'
    }
  });
};

router.get('/', getNotifications);

export default router;