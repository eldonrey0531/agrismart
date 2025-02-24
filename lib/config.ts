export type Route = string;

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  defaultAuthRedirect: Route;
  apiUrl: string;
}

export interface AuthConfig {
  publicRoutes: Route[];
  protectedRoutes: Route[];
  defaultAuthenticatedRoute: Route;
  authEndpoints: {
    login: string;
    logout: string;
    signup: string;
    resetPassword: string;
    verifyEmail: string;
    me: string;
  };
}

export const siteConfig: SiteConfig = {
  name: 'AgriSmart Platform',
  description: 'Smart agricultural management platform for modern farming',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  defaultAuthRedirect: '/dashboard', // Changed to match protected routes
  apiUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', // Changed to use same URL as app
};

export const authConfig: AuthConfig = {
  publicRoutes: [
    '/',
    '/login',
    '/signup',
    '/reset-password',
    '/verify-email',
    '/about',
    '/privacy',
    '/terms',
    '/api/auth/login', // Added API routes as public
    '/api/auth/signup',
    '/api/auth/reset-password',
    '/api/auth/verify-email',
  ],
  protectedRoutes: [
    '/dashboard',
    '/agrismart',
    '/profile',
    '/settings',
    '/api/auth/me', // Added protected API routes
    '/api/auth/logout',
    '/api/users/profile',
    '/api/users/settings',
  ],
  defaultAuthenticatedRoute: '/dashboard', // Changed to match protected routes
  authEndpoints: {
    login: '/api/auth/login', // Updated to match Next.js API routes
    logout: '/api/auth/logout',
    signup: '/api/auth/signup',
    resetPassword: '/api/auth/reset-password',
    verifyEmail: '/api/auth/verify-email',
    me: '/api/auth/me',
  },
};