'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogOut, Shield, Smartphone } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Session {
  id: string;
  createdAt: string;
  expires: string;
  createdByIp: string;
  isCurrentSession: boolean;
  device: 'current' | 'other';
}

export function ActiveSessions() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [token]);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/auth/sessions', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSessions(data.data.sessions);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch active sessions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      setRevoking(sessionId);
      const response = await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionToken: sessionId })
      });
      
      const data = await response.json();
      if (data.success) {
        setSessions(prev => prev.filter(session => session.id !== sessionId));
        toast({
          title: 'Success',
          description: 'Session revoked successfully'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke session',
        variant: 'destructive'
      });
    } finally {
      setRevoking(null);
    }
  };

  const revokeAllSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/sessions', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keepCurrent: true })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchSessions();
        toast({
          title: 'Success',
          description: 'All other sessions revoked successfully'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke sessions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Active Sessions</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={revokeAllSessions}
          disabled={sessions.length <= 1}
        >
          <Shield className="mr-2 h-4 w-4" />
          Revoke All Other Sessions
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map(session => (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <p className="font-medium">
                    {session.isCurrentSession ? 'Current Session' : 'Other Device'}
                  </p>
                  {session.isCurrentSession && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>IP: {session.createdByIp}</p>
                  <p>Created: {new Date(session.createdAt).toLocaleDateString()}</p>
                  <p>Expires: {new Date(session.expires).toLocaleDateString()}</p>
                </div>
              </div>
              {!session.isCurrentSession && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => revokeSession(session.id)}
                  disabled={revoking === session.id}
                >
                  {revoking === session.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      Revoke
                    </>
                  )}
                </Button>
              )}
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No active sessions found.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ActiveSessions;