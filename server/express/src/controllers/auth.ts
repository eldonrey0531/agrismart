import { RequestHandler } from '../types';
import { generateToken, TokenUser } from '../utils/jwt';
import { Types } from 'mongoose';

// Mock storage for registered users (in-memory for testing)
const users = new Map<string, TokenUser & { password: string; name: string }>();

// Create initial admin user
const adminUser: TokenUser & { password: string; name: string } = {
  _id: new Types.ObjectId(),
  email: 'admin@example.com',
  password: 'admin123',  // In production this would be hashed
  name: 'Admin User',
  role: 'admin',
  sessionVersion: 1
};
users.set(adminUser.email, adminUser);

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body as LoginRequest;

    const user = users.get(email);
    if (!user || user.password !== password) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        }
      });
      return;
    }

    const token = generateToken(user);
    const refreshToken = generateToken(user, true);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const register: RequestHandler = async (req, res, next) => {
  try {
    const { email, password, name } = req.body as RegisterRequest;

    if (users.has(email)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'User already exists',
          code: 'USER_EXISTS'
        }
      });
      return;
    }

    const newUser: TokenUser & { password: string; name: string } = {
      _id: new Types.ObjectId(),
      email,
      password, // In production this would be hashed
      name,
      role: 'user',
      sessionVersion: 1
    };

    // Store user in our mock database
    users.set(email, newUser);

    const token = generateToken(newUser);
    const refreshToken = generateToken(newUser, true);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getBaseInfo: RequestHandler = async (_req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        message: 'Auth API',
        status: 'operational',
        endpoints: {
          login: '/auth/login',
          register: '/auth/register'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};