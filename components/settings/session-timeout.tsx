'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { Clock } from 'lucide-react';

const TIMEOUT_OPTIONS = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 hour' },
  { value: '120', label: '2 hours' },
  { value: '240', label: '4 hours' },
  { value: '480', label: '8 hours' },
];

export function SessionTimeout() {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [timeout, setTimeout] = useState('60');
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  // Get user preferences from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('session-timeout');
    if (stored) {
      const { enabled: storedEnabled, timeout: storedTimeout } = JSON.parse(stored);
      setEnabled(storedEnabled);
      setTimeout(storedTimeout);
    }
  }, []);

  // Save preferences to local storage
  useEffect(() => {
    localStorage.setItem('session-timeout', JSON.stringify({ enabled, timeout }));
  }, [enabled, timeout]);

  // Handle session timeout
  useEffect(() => {
    if (!enabled) {
      setTimeRemaining(null);
      return;
    }

    let lastActivity = Date.now();
    const timeoutMinutes = parseInt(timeout);
    const warningThreshold = 5; // Show warning 5 minutes before timeout

    const checkActivity = () => {
      const idle = (Date.now() - lastActivity) / 1000 / 60; // Convert to minutes
      const remaining = timeoutMinutes - idle;
      setTimeRemaining(Math.max(0, Math.floor(remaining)));

      if (remaining <= warningThreshold && remaining > 0 && !showWarning) {
        setShowWarning(true);
        toast({
          title: 'Session Timeout Warning',
          description: `Your session will expire in ${Math.floor(remaining)} minutes due to inactivity.`,
          duration: 0, // Don't auto dismiss
          variant: 'destructive',
        });
      }

      if (remaining <= 0) {
        // Handle session timeout
        window.location.href = '/login?timeout=true';
      }
    };

    const resetTimer = () => {
      lastActivity = Date.now();
      setShowWarning(false);
    };

    // Check every minute
    const interval = setInterval(checkActivity, 60 * 1000);

    // Reset timer on user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      clearInterval(interval);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [enabled, timeout, toast, showWarning]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Session Timeout
        </CardTitle>
        <CardDescription>
          Automatically log out after a period of inactivity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Enable Session Timeout</Label>
            <p className="text-sm text-muted-foreground">
              Your session will expire after the selected period of inactivity
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            aria-label="Enable session timeout"
          />
        </div>

        {enabled && (
          <div className="space-y-2">
            <Label>Timeout Period</Label>
            <Select value={timeout} onValueChange={setTimeout}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeout period" />
              </SelectTrigger>
              <SelectContent>
                {TIMEOUT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {timeRemaining !== null && (
              <p className="text-sm text-muted-foreground">
                Session will timeout in: {Math.floor(timeRemaining / 60)}h {timeRemaining % 60}m
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SessionTimeout;