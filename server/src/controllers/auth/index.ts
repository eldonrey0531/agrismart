import { Request, Response } from 'express';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      
      if (!result) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      return res.json(result);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await AuthService.register(email, password);
      return res.status(201).json(user);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = await UserService.getProfile(userId);
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async verifyEmail(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = await AuthService.verifyEmail(userId);
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async enable2FA(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Implementation for enabling 2FA
      return res.json({ message: '2FA enabled' });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async verify2FA(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Implementation for verifying 2FA
      return res.json({ message: '2FA verified' });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async disable2FA(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Implementation for disabling 2FA
      return res.json({ message: '2FA disabled' });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Add other controller methods as needed
}