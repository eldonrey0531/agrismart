import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/use-toast';

export interface LoginEvent {
  id: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed';
  reason?: string;
  location?: string;
  device?: string;
}

export interface SecurityStats {
  totalLogins: number;
  failedAttempts: number;
  successRate: number;
  uniqueDevices: number;
  uniqueLocations: number;
  lastFailedAttempt?: LoginEvent;
  recentEvents: LoginEvent[];
  topLocations: { location: string; count: number }[];
  topDevices: { device: string; count: number }[];
  loginTrends: { date: string; successful: number; failed: number }[];
}

interface SecurityAnalyticsResult {
  loading: boolean;
  stats: SecurityStats | null;
  events: LoginEvent[];
  error: string | null;
  refresh: () => void;
}

export function useSecurityAnalytics(days: number = 30): SecurityAnalyticsResult {
  const { token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch login events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login-history', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.data.events);
        processStats(data.data.events);
      } else {
        throw new Error(data.message || 'Failed to fetch login history');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Process events into stats
  const processStats = (events: LoginEvent[]) => {
    const now = new Date();
    const cutoff = new Date(now.setDate(now.getDate() - days));

    // Filter events within date range
    const filteredEvents = events.filter(
      event => new Date(event.timestamp) > cutoff
    );

    // Calculate basic stats
    const totalLogins = filteredEvents.length;
    const failedAttempts = filteredEvents.filter(e => e.status === 'failed').length;
    const successRate = totalLogins ? 
      ((totalLogins - failedAttempts) / totalLogins) * 100 : 0;

    // Get unique devices and locations
    const uniqueDevices = new Set(filteredEvents.map(e => e.device)).size;
    const uniqueLocations = new Set(filteredEvents.map(e => e.location)).size;

    // Get last failed attempt
    const lastFailedAttempt = filteredEvents
      .find(e => e.status === 'failed');

    // Calculate top locations
    const locationCounts = filteredEvents.reduce((acc, event) => {
      const location = event.location || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topLocations = Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate top devices
    const deviceCounts = filteredEvents.reduce((acc, event) => {
      const device = event.device || 'Unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topDevices = Object.entries(deviceCounts)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate login trends
    const loginTrends = generateLoginTrends(filteredEvents, days);

    setStats({
      totalLogins,
      failedAttempts,
      successRate,
      uniqueDevices,
      uniqueLocations,
      lastFailedAttempt,
      recentEvents: filteredEvents.slice(0, 10),
      topLocations,
      topDevices,
      loginTrends,
    });
  };

  // Generate daily login trends
  const generateLoginTrends = (events: LoginEvent[], days: number) => {
    const trends: { date: string; successful: number; failed: number }[] = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEvents = events.filter(
        e => e.timestamp.startsWith(dateStr)
      );
      
      trends.push({
        date: dateStr,
        successful: dayEvents.filter(e => e.status === 'success').length,
        failed: dayEvents.filter(e => e.status === 'failed').length,
      });
    }
    
    return trends;
  };

  // Initial fetch
  useEffect(() => {
    if (token) {
      fetchEvents();
    }
  }, [token, days]);

  return {
    loading,
    stats,
    events,
    error,
    refresh: fetchEvents
  };
}