// Global type definitions

// User and Authentication
export interface User {
  id: string;
  email: string;
  roles: string[];
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  bio?: string;
}

// Authentication
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}

// API and Requests
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

// Role-Based Access Control
export type UserRole = 'user' | 'admin' | 'super_admin';

export interface RBACConfig {
  roles: UserRole[];
  superAdmin?: UserRole[];
}

// Security and Validation
export interface ValidationError {
  field: string;
  message: string;
}

export interface SecurityConfig {
  csrfToken?: string;
  nonce?: string;
}

// Marketplace
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  sellerId: string;
  seller?: User;
}

// Notifications
export interface Notification {
  id: string;
  type: string;
  content: string;
  userId: string;
  read: boolean;
}

// Chat and Messaging
export interface Message {
  id: string;
  content: string;
  senderId: string;
  chatId: string;
  sender?: User;
}