import express from 'express';
import { login, register, getBaseInfo } from '../../controllers/auth';
import { asyncHandler } from '../../utils/express-utils';

const router = express.Router();

// Log all auth requests in development
if (process.env.NODE_ENV === 'development') {
  router.use((req, _res, next) => {
    console.log(`Auth route accessed: ${req.method} ${req.path}`);
    next();
  });
}

// Public auth endpoints
router.post('/login', asyncHandler(login));
router.post('/register', asyncHandler(register));
router.get('/', asyncHandler(getBaseInfo));

export default router;