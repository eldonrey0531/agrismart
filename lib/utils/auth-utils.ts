import { Route, authConfig } from '@/lib/config';

const isDev = process.env.NODE_ENV === 'development';

function debugLog(message: string, data?: any) {
  if (isDev) {
    console.log(`[Auth Debug] ${message}`, data || '');
  }
}

/**
 * Checks if a given path is a public route
 */
export function isPublicRoute(path: Route): boolean {
  const result = authConfig.publicRoutes.some(route => {
    // Exact match
    if (route === path) return true;
    // Check if path starts with a public route (for nested routes)
    if (route.endsWith('/*')) {
      const baseRoute = route.slice(0, -2);
      return path.startsWith(baseRoute);
    }
    return false;
  });

  debugLog(`Checking if ${path} is public: ${result}`);
  return result;
}

/**
 * Checks if a given path is a protected route
 */
export function isProtectedRoute(path: Route): boolean {
  const result = authConfig.protectedRoutes.some(route => {
    // Exact match
    if (route === path) return true;
    // Check if path starts with a protected route (for nested routes)
    return path.startsWith(route);
  });

  debugLog(`Checking if ${path} is protected: ${result}`);
  return result;
}

/**
 * Gets the appropriate redirect path after login
 */
export function getAuthRedirectPath(redirectTo: string | null): Route {
  debugLog('Getting auth redirect path', { redirectTo });

  // If redirectTo is provided and it's not a public route, use it
  if (redirectTo && !isPublicRoute(redirectTo)) {
    debugLog('Using provided redirect path', { redirectTo });
    return redirectTo;
  }

  // Otherwise use the default authenticated route
  debugLog('Using default authenticated route', { 
    route: authConfig.defaultAuthenticatedRoute 
  });
  return authConfig.defaultAuthenticatedRoute;
}

/**
 * Validates if a route is safe for redirection
 */
export function isSafeRedirectPath(path: string): boolean {
  debugLog('Checking if redirect path is safe', { path });

  // Check if path is absolute URL
  try {
    const url = new URL(path, window.location.origin);
    // Only allow redirects to same origin
    const isSafe = url.origin === window.location.origin;
    debugLog('Redirect path safety check result', { path, isSafe });
    return isSafe;
  } catch {
    // If path is not a valid URL, check if it's a valid relative path
    const isRelative = path.startsWith('/') && !path.startsWith('//');
    debugLog('Relative path safety check result', { path, isRelative });
    return isRelative;
  }
}

/**
 * Gets login URL with redirect parameter
 */
export function getLoginUrl(redirectTo?: string): string {
  debugLog('Building login URL', { redirectTo });

  const params = new URLSearchParams();
  if (redirectTo && isSafeRedirectPath(redirectTo)) {
    params.set('redirectTo', redirectTo);
  }
  const queryString = params.toString();
  const url = `/login${queryString ? `?${queryString}` : ''}`;

  debugLog('Generated login URL', { url });
  return url;
}

export function logAuthFlow(action: string, data: any) {
  if (isDev) {
    console.group(`[Auth Flow] ${action}`);
    console.log('Data:', data);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
  }
}