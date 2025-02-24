"use client";

import { useState } from "react";
import { useServiceWorker } from "@/hooks/use-service-worker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Leaf, 
  CloudOff, 
  RefreshCcw, 
  Trash2, 
  Database,
  Settings,
  Sprout 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsPanelProps {
  className?: string;
}

export function SettingsPanel({ className }: SettingsPanelProps) {
  const { isSupported, isRegistered, isOffline, update } = useServiceWorker();
  const [isClearing, setIsClearing] = useState(false);
  const [clearProgress, setClearProgress] = useState(0);
  const [notifications, setNotifications] = useState(false);
  const [offlineMode, setOfflineMode] = useState(true);

  // Request notification permission
  const handleNotificationToggle = async () => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      setNotifications(!notifications);
    } else {
      const permission = await Notification.requestPermission();
      setNotifications(permission === "granted");
    }
  };

  // Clear cache
  const handleClearCache = async () => {
    if (!("caches" in window)) return;

    setIsClearing(true);
    setClearProgress(0);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setClearProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 50);

      // Clear caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));

      // Ensure progress completes
      setTimeout(() => {
        setIsClearing(false);
        setClearProgress(0);
      }, 2000);
    } catch (error) {
      console.error("Failed to clear cache:", error);
      setIsClearing(false);
      setClearProgress(0);
    }
  };

  if (!isSupported || !isRegistered) {
    return (
      <Card className={cn("border-border", className)}>
        <CardHeader>
          <CardTitle className="text-destructive">PWA Not Supported</CardTitle>
          <CardDescription>
            Your browser does not support Progressive Web App features.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          PWA Settings
        </CardTitle>
        <CardDescription>
          Manage your Progressive Web App preferences and data
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Connection Status</Label>
            <div className="text-sm text-muted-text">
              {isOffline ? "Working offline" : "Connected to network"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOffline ? (
              <CloudOff className="h-5 w-5 text-destructive animate-bounce-slow" />
            ) : (
              <Leaf className="h-5 w-5 text-success animate-pulse" />
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="notifications">Notifications</Label>
            <div className="text-sm text-muted-text">
              Receive updates about new features and changes
            </div>
          </div>
          <Switch
            id="notifications"
            checked={notifications}
            onCheckedChange={handleNotificationToggle}
          />
        </div>

        {/* Offline Mode */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="offline-mode">Offline Mode</Label>
            <div className="text-sm text-muted-text">
              Cache content for offline access
            </div>
          </div>
          <Switch
            id="offline-mode"
            checked={offlineMode}
            onCheckedChange={setOfflineMode}
          />
        </div>

        {/* Storage Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Storage Usage</Label>
            <div className="text-sm text-muted-text">
              <Database className="h-4 w-4 inline-block mr-1" />
              ~24MB used
            </div>
          </div>
          {isClearing ? (
            <div className="space-y-2">
              <Progress value={clearProgress} className="h-1" />
              <p className="text-xs text-muted-text text-center">
                Clearing cached data...
              </p>
            </div>
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          onClick={update}
          className="w-full sm:w-auto group"
        >
          <RefreshCcw className="mr-2 h-4 w-4 transition-transform group-hover:rotate-180" />
          Check for Updates
        </Button>
        <Button
          variant="destructive"
          onClick={handleClearCache}
          disabled={isClearing}
          className="w-full sm:w-auto group"
        >
          {isClearing ? (
            <Sprout className="mr-2 h-4 w-4 animate-bounce" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
          )}
          Clear Cache
        </Button>
      </CardFooter>
    </Card>
  );
}

export default SettingsPanel;