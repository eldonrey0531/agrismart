import { prisma } from "@/lib/db";
import type {
  CreateUserOptions,
  UserUpdateOptions,
  SafeUser,
  UserSecurity,
  UserNotifications,
  UserProfile,
  SecurityUpdateResponse,
  ProfileUpdateResponse,
  NotificationUpdateResponse,
} from "@/types/user";
import { Prisma, UserStatus } from "@prisma/client";
import { hashPassword } from "@/lib/auth/utils";
import { generateRecoveryCodes, hashRecoveryCode } from "@/lib/utils/totp";
import {
  AuthError,
  EmailAlreadyExistsError,
  UserNotFoundError,
} from "@/lib/auth/utils";

/**
 * Create a new user with security settings
 */
export async function createUser(options: CreateUserOptions): Promise<SafeUser> {
  const { email, password, name, role } = options;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new EmailAlreadyExistsError();
    }

    const hashedPassword = await hashPassword(password);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || "USER",
        status: "ACTIVE",
      },
    });

    const { password: _, ...safeUser } = user;
    return safeUser;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new EmailAlreadyExistsError();
      }
    }
    throw new AuthError("Failed to create user", "CREATE_USER_FAILED");
  }
}

/**
 * Update user security settings
 */
export async function updateUserSecurity(
  userId: string,
  data: Partial<UserSecurity>
): Promise<SecurityUpdateResponse> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    const { password: _, ...safeUser } = user;
    return {
      success: true,
      message: "Security settings updated successfully",
      user: safeUser,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new UserNotFoundError();
      }
    }
    throw new AuthError("Failed to update security settings", "UPDATE_SECURITY_FAILED");
  }
}

/**
 * Update user profile information
 */
export async function updateUserProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<ProfileUpdateResponse> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    const { password: _, ...safeUser } = user;
    return {
      success: true,
      message: "Profile updated successfully",
      user: safeUser,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new UserNotFoundError();
      }
    }
    throw new AuthError("Failed to update profile", "UPDATE_PROFILE_FAILED");
  }
}

/**
 * Update user notification preferences
 */
export async function updateUserNotifications(
  userId: string,
  data: Partial<UserNotifications>
): Promise<NotificationUpdateResponse> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    return {
      success: true,
      message: "Notification settings updated successfully",
      settings: {
        emailNotifications: user.emailNotifications,
        emailDigest: user.emailDigest,
        marketplaceUpdates: user.marketplaceUpdates,
        newMessages: user.newMessages,
        newConnections: user.newConnections,
        marketingEmails: user.marketingEmails,
        emailFrequency: user.emailFrequency,
      },
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new UserNotFoundError();
      }
    }
    throw new AuthError("Failed to update notification settings", "UPDATE_NOTIFICATIONS_FAILED");
  }
}

/**
 * Setup 2FA for user
 */
export async function setupUserTwoFactor(userId: string, secret: string): Promise<SafeUser> {
  try {
    const recoveryCodes = generateRecoveryCodes();
    const hashedCodes = await Promise.all(
      recoveryCodes.map(code => hashRecoveryCode(code))
    );

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: true,
        recoveryCodes: hashedCodes,
        tempTwoFactorSecret: null,
        tempTwoFactorTimestamp: null,
        lastTwoFactorVerification: new Date(),
        updatedAt: new Date(),
      },
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    const { password: _, ...safeUser } = user;
    return safeUser;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError("Failed to setup 2FA", "SETUP_2FA_FAILED");
  }
}

/**
 * Disable 2FA for user
 */
export async function disableUserTwoFactor(userId: string): Promise<SafeUser> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        recoveryCodes: [],
        tempTwoFactorSecret: null,
        tempTwoFactorTimestamp: null,
        lastTwoFactorVerification: null,
        updatedAt: new Date(),
      },
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    const { password: _, ...safeUser } = user;
    return safeUser;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError("Failed to disable 2FA", "DISABLE_2FA_FAILED");
  }
}

/**
 * Lock user account
 */
export async function lockUserAccount(userId: string, duration: number): Promise<SafeUser> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.LOCKED,
        lockoutUntil: new Date(Date.now() + duration),
        updatedAt: new Date(),
      },
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    const { password: _, ...safeUser } = user;
    return safeUser;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError("Failed to lock account", "LOCK_ACCOUNT_FAILED");
  }
}

/**
 * Unlock user account
 */
export async function unlockUserAccount(userId: string): Promise<SafeUser> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.ACTIVE,
        lockoutUntil: null,
        failedLoginAttempts: 0,
        updatedAt: new Date(),
      },
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    const { password: _, ...safeUser } = user;
    return safeUser;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError("Failed to unlock account", "UNLOCK_ACCOUNT_FAILED");
  }
}