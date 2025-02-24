import { headers } from 'next/headers'
import type { NextRequest } from 'next/server'

export function getIP(req?: NextRequest): string {
  if (req) {
    // For API routes using NextRequest
    const forwardedFor = req.headers.get('x-forwarded-for')
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim()
    }
    return req.ip || '127.0.0.1'
  }

  // For server components using headers()
  const headersList = headers()
  const forwardedFor = headersList.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  // Fallback
  return '127.0.0.1'
}

export function isLocalIP(ip: string): boolean {
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.')
  )
}

// For testing and development
export function getMockIP(): string {
  return process.env.NODE_ENV === 'test'
    ? '127.0.0.1'
    : '203.0.113.1' // TEST-NET-3 documentation range
}