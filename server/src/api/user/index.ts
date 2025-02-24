import { Router } from 'express';
import { UserController } from '../../controllers/user';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { userValidation } from '../../lib/validation/user.schemas';
import { uploads } from '../../middleware/upload';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Profile management
router.get(
  '/profile',
  UserController.getProfile
);

router.put(
  '/profile',
  validate({
    body: userValidation.updateProfile
  }),
  UserController.updateProfile
);

router.post(
  '/profile/avatar',
  uploads.single('avatar'),
  validate({
    body: userValidation.avatar
  }),
  UserController.updateAvatar
);

// Account settings
router.get(
  '/settings',
  UserController.getSettings
);

router.put(
  '/settings',
  validate({
    body: userValidation.updateSettings
  }),
  UserController.updateSettings
);

// Security
router.put(
  '/password',
  validate({
    body: userValidation.changePassword
  }),
  UserController.changePassword
);

router.post(
  '/2fa/enable',
  validate({
    body: userValidation.enable2FA
  }),
  UserController.enable2FA
);

router.post(
  '/2fa/verify',
  validate({
    body: userValidation.verify2FA
  }),
  UserController.verify2FA
);

router.post(
  '/2fa/disable',
  validate({
    body: userValidation.disable2FA
  }),
  UserController.disable2FA
);

// Notifications
router.get(
  '/notifications',
  validate({
    query: userValidation.notifications
  }),
  UserController.getNotifications
);

router.post(
  '/notifications/settings',
  validate({
    body: userValidation.notificationSettings
  }),
  UserController.updateNotificationSettings
);

// Account data
router.get(
  '/data/export',
  UserController.exportAccountData
);

router.post(
  '/data/delete',
  validate({
    body: userValidation.deleteAccount
  }),
  UserController.deleteAccount
);

// Activity logs
router.get(
  '/activity',
  validate({
    query: userValidation.activityLogs
  }),
  UserController.getActivityLogs
);

// Connected accounts
router.get(
  '/connected-accounts',
  UserController.getConnectedAccounts
);

router.post(
  '/connected-accounts/:provider',
  validate({
    params: userValidation.provider,
    body: userValidation.connectAccount
  }),
  UserController.connectAccount
);

router.delete(
  '/connected-accounts/:provider',
  validate({
    params: userValidation.provider
  }),
  UserController.disconnectAccount
);

// Address management
router.get(
  '/addresses',
  UserController.getAddresses
);

router.post(
  '/addresses',
  validate({
    body: userValidation.createAddress
  }),
  UserController.createAddress
);

router.put(
  '/addresses/:id',
  validate({
    params: userValidation.addressId,
    body: userValidation.updateAddress
  }),
  UserController.updateAddress
);

router.delete(
  '/addresses/:id',
  validate({
    params: userValidation.addressId
  }),
  UserController.deleteAddress
);

export default router;