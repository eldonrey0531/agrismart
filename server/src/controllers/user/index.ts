import { Request, Response } from 'express';
import { UserService } from '../../services/user.service';
import { ResponseHandler } from '../../utils/response-handler';
import { throwHttpError } from '../../lib/http-errors';
import { storage } from '../../lib/storage';

export class UserController {
  static async getProfile(req: Request, res: Response) {
    try {
      const profile = await UserService.getProfile(req.user!.id);
      ResponseHandler.success(res, profile);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const profile = await UserService.updateProfile(req.user!.id, req.body);
      ResponseHandler.success(res, profile);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async updateAvatar(req: Request, res: Response) {
    try {
      if (!req.file) {
        throwHttpError.badRequest('No file uploaded');
      }

      const avatarUrl = await storage.saveFile(req.file!);
      const profile = await UserService.updateProfile(req.user!.id, {
        avatar: avatarUrl
      });

      ResponseHandler.success(res, profile);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async getSettings(req: Request, res: Response) {
    try {
      const settings = await UserService.getSettings(req.user!.id);
      ResponseHandler.success(res, settings);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async updateSettings(req: Request, res: Response) {
    try {
      const settings = await UserService.updateSettings(req.user!.id, req.body);
      ResponseHandler.success(res, settings);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      await UserService.changePassword(req.user!.id, currentPassword, newPassword);
      ResponseHandler.success(res, null, 'Password updated successfully');
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async enable2FA(req: Request, res: Response) {
    try {
      const secret = await UserService.setup2FA(req.user!.id);
      ResponseHandler.success(res, { secret });
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async verify2FA(req: Request, res: Response) {
    try {
      const { token } = req.body;
      await UserService.verify2FA(req.user!.id, token);
      ResponseHandler.success(res, null, '2FA enabled successfully');
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async disable2FA(req: Request, res: Response) {
    try {
      await UserService.disable2FA(req.user!.id);
      ResponseHandler.success(res, null, '2FA disabled successfully');
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async getNotificationPreferences(req: Request, res: Response) {
    try {
      const preferences = await UserService.getNotificationPreferences(req.user!.id);
      ResponseHandler.success(res, preferences);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async updateNotificationPreferences(req: Request, res: Response) {
    try {
      const preferences = await UserService.updateNotificationPreferences(
        req.user!.id,
        req.body
      );
      ResponseHandler.success(res, preferences);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async getActiveSessions(req: Request, res: Response) {
    try {
      const sessions = await UserService.getActiveSessions(req.user!.id);
      ResponseHandler.success(res, sessions);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async revokeSession(req: Request, res: Response) {
    try {
      await UserService.revokeSession(req.user!.id, req.body.sessionId);
      ResponseHandler.success(res, null, 'Session revoked successfully');
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async revokeAllSessions(req: Request, res: Response) {
    try {
      await UserService.revokeAllSessions(req.user!.id);
      ResponseHandler.success(res, null, 'All sessions revoked successfully');
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async upgradeToSeller(req: Request, res: Response) {
    try {
      const seller = await UserService.upgradeToSeller(req.user!.id, req.body);
      ResponseHandler.success(res, seller);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async getSellerStatus(req: Request, res: Response) {
    try {
      const status = await UserService.getSellerStatus(req.user!.id);
      ResponseHandler.success(res, status);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async exportAccountData(req: Request, res: Response) {
    try {
      const data = await UserService.exportAccountData(req.user!.id);
      ResponseHandler.success(res, data);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async deactivateAccount(req: Request, res: Response) {
    try {
      await UserService.deactivateAccount(req.user!.id, req.body.password);
      ResponseHandler.success(res, null, 'Account deactivated successfully');
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async deleteAccount(req: Request, res: Response) {
    try {
      await UserService.deleteAccount(req.user!.id, req.body.password);
      ResponseHandler.success(res, null, 'Account deleted successfully');
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }
}