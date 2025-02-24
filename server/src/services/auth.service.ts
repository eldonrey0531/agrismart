import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { appConfig } from '../config/app.config';

const prisma = new PrismaClient();

export class AuthService {
  static async login(email: string, password: string) {
    try {
      const user = await prisma.user.findUnique({ 
        where: { email } 
      });

      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      const token = jwt.sign(
        { userId: user.id },
        appConfig.security.jwtSecret,
        { expiresIn: appConfig.security.jwtExpiry }
      );

      // Log login attempt
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          success: true,
          ipAddress: '0.0.0.0', // Should be from request
          userAgent: 'Unknown' // Should be from request
        }
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      };
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  static async register(email: string, password: string) {
    try {
      const hashedPassword = await bcrypt.hash(password, appConfig.security.bcryptRounds);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          emailVerified: false
        }
      });

      // Send verification email
      // await EmailService.sendVerificationEmail(user.email);

      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static async verifyEmail(userId: string) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true }
      });

      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified
      };
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  static async resetPassword(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return false;
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id },
        appConfig.security.jwtSecret,
        { expiresIn: '1h' }
      );

      // Store reset token
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt: new Date(Date.now() + 3600000) // 1 hour
        }
      });

      // Send reset email
      // await EmailService.sendPasswordResetEmail(email, resetToken);

      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  // Add other auth-related methods as needed
}
