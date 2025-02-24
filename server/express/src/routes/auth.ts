import express from 'express';
import { Types } from 'mongoose';
import { TokenUser } from '../utils/jwt';
import { generateToken } from '../utils/jwt';
import { RequestHandler } from '../types';

const router = express.Router();

// Mock storage for registered users (in-memory for testing)
const users = new Map<string, TokenUser & { password: string; name: string }>();

// Create initial admin user
const adminUser: TokenUser & { password: string; name: string } = {
  _id: new Types.ObjectId(),
  email: 'admin@example.com',
  role: 'admin',
  name: 'Admin User',
  password: 'admin123',  // In production this would be hashed
  sessionVersion: 1
};
users.set(adminUser.email, adminUser);

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'user';
}

const register: RequestHandler = async (req, res) => {
  try {
    const { email, password, name, role = 'user' } = req.body as RegisterRequest;

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
      role,
      name,
      password, // In production this would be hashed
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
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Registration failed',
        code: 'REGISTRATION_ERROR'
      }
    });
  }
};

const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

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
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Login failed',
        code: 'LOGIN_ERROR'
      }
    });
  }
};

// Base route info
const getInfo: RequestHandler = async (_req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Auth API',
      status: 'operational',
      endpoints: {
        register: '/auth/register',
        login: '/auth/login'
      }
    }
  });
};

// Routes
router.post('/register', register);
router.post('/login', login);
router.get('/', getInfo);

export default router;