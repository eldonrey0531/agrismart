import { NextApiRequest, NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = verify(token, process.env.JWT_SECRET as string);
    req.user = decoded as AuthenticatedRequest['user'];
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid authentication token' });
  }
};

export default authMiddleware;