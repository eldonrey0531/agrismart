import { NextRequest } from 'next/server';
import { headers } from 'next/headers';

export interface ClientInfo {
  ipAddress: string;
  userAgent: string;
  location: string | null;
  device: string;
  browser: string;
  os: string;
}

/**
 * Get the client's IP address from various headers
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Get IP from socket
  const socketAddr = req.headers.get('x-real-ip') || 
                    req.headers.get('x-client-ip') || 
                    '0.0.0.0';
  
  return socketAddr;
}

/**
 * Get the client's user agent string
 */
export function getUserAgent(req: NextRequest): string {
  return req.headers.get('user-agent') || 'Unknown';
}

/**
 * Parse browser and device info from user agent
 */
function parseUserAgent(userAgent: string): { browser: string; os: string; device: string } {
  // Basic UA parsing - can be enhanced with ua-parser-js if needed
  const browser = userAgent.match(/(?:Chrome|Firefox|Safari|Edge|MSIE|Opera)\/?\s*(\d+)/i);
  const os = userAgent.match(/(?:Windows NT|Mac OS X|Linux|Android|iOS)\s*([0-9._]+)?/i);
  const device = userAgent.match(/(?:iPhone|iPad|Android|Mobile|Tablet)/i);

  return {
    browser: browser ? `${browser[0]}` : 'Unknown',
    os: os ? `${os[0]}` : 'Unknown',
    device: device ? device[0] : 'Desktop',
  };
}

/**
 * Get comprehensive client information
 */
export async function getClientInfo(req: NextRequest): Promise<ClientInfo> {
  const userAgent = getUserAgent(req);
  const ipAddress = getClientIp(req);
  
  // Parse user agent
  const { browser, os, device } = parseUserAgent(userAgent);

  // Try to get location info
  let location: string | null = null;
  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ipAddress}`);
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      if (geoData.status === 'success') {
        location = `${geoData.city}, ${geoData.country}`;
      }
    }
  } catch (error) {
    console.error('Error getting location:', error);
  }

  return {
    ipAddress,
    userAgent,
    location,
    device,
    browser,
    os,
  };
}

/**
 * Get request information for security logging
 */
export function getRequestInfo(req: NextRequest) {
  return {
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
    device: parseUserAgent(getUserAgent(req)).device,
    timestamp: new Date(),
  };
}

/**
 * Check if request has valid authentication token
 */
export function isAuthenticated(req: NextRequest): boolean {
  return !!req.headers.get('authorization')?.startsWith('Bearer ');
}

/**
 * Extract bearer token from request
 */
export function getToken(req: NextRequest): string | null {
  return req.headers.get('authorization')?.split('Bearer ')[1] || null;
}

/**
 * Get request method
 */
export function getMethod(req: NextRequest): string {
  return req.method.toUpperCase();
}

/**
 * Get request path
 */
export function getPath(req: NextRequest): string {
  return req.nextUrl.pathname;
}

/**
 * Get request query parameters
 */
export function getQuery(req: NextRequest): Record<string, string> {
  return Object.fromEntries(req.nextUrl.searchParams);
}