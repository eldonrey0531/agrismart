import { LoginEvent, SecurityStats } from '@/hooks/use-security-analytics';

export type SecurityEventType = 
  | 'failed_login'
  | 'suspicious_activity'
  | 'new_device'
  | 'new_location'
  | 'multiple_failures'
  | 'account_locked'
  | 'password_expired'
  | 'session_expired';

export interface SecurityNotification {
  id: string;
  type: SecurityEventType;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  metadata?: Record<string, any>;
  read?: boolean;
  actionTaken?: boolean;
}

interface SecurityThresholds {
  failedLoginThreshold: number;  // Number of failed attempts before alert
  newLocationCooldown: number;   // Hours before new location alert reset
  suspiciousActivityScore: number; // Score threshold for suspicious activity
  deviceTrustAge: number;       // Days before device is considered trusted
}

// Default security thresholds
const DEFAULT_THRESHOLDS: SecurityThresholds = {
  failedLoginThreshold: 3,
  newLocationCooldown: 24,
  suspiciousActivityScore: 0.7,
  deviceTrustAge: 30,
};

// In-memory store for recent events and notifications
const recentEvents = new Map<string, LoginEvent[]>();
const knownDevices = new Map<string, Set<string>>();
const knownLocations = new Map<string, Set<string>>();

export function analyzeSecurity(
  userId: string,
  event: LoginEvent,
  stats: SecurityStats,
  thresholds: SecurityThresholds = DEFAULT_THRESHOLDS
): SecurityNotification[] {
  const notifications: SecurityNotification[] = [];

  // Get recent events for the user
  const userEvents = recentEvents.get(userId) || [];
  userEvents.push(event);
  // Keep last 100 events
  if (userEvents.length > 100) userEvents.shift();
  recentEvents.set(userId, userEvents);

  // Check for multiple failed attempts
  const recentFailures = userEvents
    .filter(e => e.status === 'failed')
    .filter(e => {
      const eventTime = new Date(e.timestamp);
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return eventTime > hourAgo;
    });

  if (recentFailures.length >= thresholds.failedLoginThreshold) {
    const failureLocations = new Set(recentFailures.map(e => e.location || 'Unknown'));
    const failureDevices = new Set(recentFailures.map(e => e.device || 'Unknown'));

    notifications.push({
      id: crypto.randomUUID(),
      type: 'multiple_failures',
      title: 'Multiple Failed Login Attempts',
      message: `${recentFailures.length} failed login attempts detected in the last hour`,
      severity: 'high',
      timestamp: new Date().toISOString(),
      metadata: {
        attempts: recentFailures.length,
        locations: Array.from(failureLocations),
        devices: Array.from(failureDevices)
      }
    });
  }

  // Check for new device
  const userDevices = knownDevices.get(userId) || new Set<string>();
  if (event.device && !userDevices.has(event.device)) {
    userDevices.add(event.device);
    knownDevices.set(userId, userDevices);

    notifications.push({
      id: crypto.randomUUID(),
      type: 'new_device',
      title: 'New Device Detected',
      message: `Login from a new device: ${event.device}`,
      severity: 'medium',
      timestamp: new Date().toISOString(),
      metadata: {
        device: event.device,
        location: event.location,
        ipAddress: event.ipAddress
      }
    });
  }

  // Check for new location
  const userLocations = knownLocations.get(userId) || new Set<string>();
  if (event.location && !userLocations.has(event.location)) {
    userLocations.add(event.location);
    knownLocations.set(userId, userLocations);

    notifications.push({
      id: crypto.randomUUID(),
      type: 'new_location',
      title: 'New Login Location',
      message: `Login detected from a new location: ${event.location}`,
      severity: 'medium',
      timestamp: new Date().toISOString(),
      metadata: {
        location: event.location,
        device: event.device,
        ipAddress: event.ipAddress
      }
    });
  }

  // Check for suspicious activity (rapid location changes)
  const recentLocationList = userEvents
    .slice(-5)
    .map(e => e.location)
    .filter((location): location is string => location !== undefined);
  
  const recentLocations = new Set(recentLocationList);

  if (recentLocations.size >= 3) {
    notifications.push({
      id: crypto.randomUUID(),
      type: 'suspicious_activity',
      title: 'Suspicious Login Pattern',
      message: 'Multiple logins from different locations detected',
      severity: 'high',
      timestamp: new Date().toISOString(),
      metadata: {
        locations: Array.from(recentLocations),
        timespan: '1 hour'
      }
    });
  }

  return notifications;
}

// Clean up old data periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Clean up recent events
    recentEvents.forEach((events, userId) => {
      const filtered = events.filter(
        event => new Date(event.timestamp) > oneWeekAgo
      );
      if (filtered.length !== events.length) {
        recentEvents.set(userId, filtered);
      }
    });
  }, 24 * 60 * 60 * 1000); // Run daily
}