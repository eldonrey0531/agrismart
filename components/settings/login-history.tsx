'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, AlertCircle, CheckCircle2, History } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface LoginEvent {
  id: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed';
  reason?: string;
  location?: string;
  device?: string;
}

export function LoginHistory() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<LoginEvent[]>([]);

  useEffect(() => {
    fetchLoginHistory();
  }, [token]);

  const fetchLoginHistory = async () => {
    try {
      const response = await fetch('/api/auth/login-history', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setEvents(data.data.events);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch login history',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <History className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEventDescription = (event: LoginEvent) => {
    if (event.status === 'failed') {
      return `Failed login attempt - ${event.reason || 'Unknown reason'}`;
    }
    return 'Successful login';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Login History
          </CardTitle>
          <CardDescription>
            Recent login attempts and security events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Login History
        </CardTitle>
        <CardDescription>
          Recent login attempts and security events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start space-x-4 rounded-lg border p-4"
              >
                <div className="mt-1">{getEventIcon(event.status)}</div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {getEventDescription(event)}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <p>{format(new Date(event.timestamp), 'PPpp')}</p>
                    <p>IP: {event.ipAddress}</p>
                    {event.location && <p>Location: {event.location}</p>}
                    {event.device && <p>Device: {event.device}</p>}
                  </div>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">
                No login events found
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default LoginHistory;