import { Router } from 'express';

const router = Router();

// GET /api/v1/chat - Chat status
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Chat routes working',
  });
});

export default router;