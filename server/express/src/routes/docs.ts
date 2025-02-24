import express from 'express';
import { RequestHandler } from '../types';

const router = express.Router();

const getDocumentation: RequestHandler<any> = async (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Documentation coming soon'
    }
  });
};

router.get('/', getDocumentation);

export default router;