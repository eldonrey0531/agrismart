import { Router } from 'express';
import type { Request, Response } from 'express';
import { auth } from '../middleware/auth';
import { sendSuccess } from '../utils/response';

const router = Router();

/**
 * GET /api/protected
 * Protected route requiring authentication
 */
router.get('/', auth.required, (_req: Request, res: Response) => {
  sendSuccess(res, null, 200, 'Protected route accessed successfully');
});

/**
 * GET /api/protected/admin
 * Protected route requiring admin role
 */
router.get('/admin', auth.required, auth.admin, (_req: Request, res: Response) => {
  sendSuccess(res, null, 200, 'Admin route accessed successfully');
});

export { router as protectedRouter };