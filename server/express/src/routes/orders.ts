import express from 'express';
import { RequestHandler } from '../types';

const router = express.Router();

const getOrders: RequestHandler<any> = async (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Orders endpoints coming soon'
    }
  });
};

const createOrder: RequestHandler<any> = async (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Order creation endpoint coming soon'
    }
  });
};

router.get('/', getOrders);
router.post('/', createOrder);

export default router;