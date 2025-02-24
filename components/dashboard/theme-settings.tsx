'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { useThemeAnalytics } from '@/hooks/use-theme-analytics';
import { Icons } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Theme = 'light' | 'dark' | 'system';

const themeOptions: { value: Theme; label: string; icon: keyof typeof Icons }[] = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'laptop' },
];

interface ThemeSettingsProps {
  className?: string;
}

export function ThemeSettings({ className }: ThemeSettingsProps) {
  const { theme = 'system', setTheme } = useTheme();
  const { getThemeHistory, getMostUsedTheme } = useThemeAnalytics();
  const themeHistory = getThemeHistory();
  const mostUsedTheme = getMostUsedTheme();

  const handleThemeChange = (value: Theme) => {
    setTheme(value);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize how the dashboard looks and feels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Selector */}
        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <Select
            value={theme}
            onValueChange={handleThemeChange}
          >
            <SelectTrigger id="theme" className="w-full">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              {themeOptions.map(({ value, label, icon }) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center gap-2">
                    {React.createElement(Icons[icon], {
                      className: "h-4 w-4"
                    })}
                    <span>{label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Label>Quick Actions</Label>
          <div className="grid grid-cols-2 gap-2">
            {themeOptions.slice(0, 2).map(({ value, label, icon }) => (
              <Button
                key={value}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleThemeChange(value)}
              >
                {React.createElement(Icons[icon], {
                  className: "mr-2 h-4 w-4"
                })}
                {label} Mode
              </Button>
            ))}
          </div>
        </div>

        {/* Theme History */}
        {themeHistory.length > 0 && (
          <div className="space-y-2">
            <Label>Theme History</Label>
            <div className="rounded-md border">
              <div className="p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Most Used Theme</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {mostUsedTheme || 'Not enough data'}
                  </p>
                </div>
              </div>
              <div className="border-t">
                <div className="bg-muted/50 p-2">
                  <p className="text-xs font-medium">Recent Changes</p>
                </div>
                <div className="divide-y">
                  {themeHistory.slice(-5).reverse().map((entry, index) => (
                    <div
                      key={`${entry.theme}-${entry.timestamp}`}
                      className="flex items-center justify-between p-2"
                    >
                      <div className="flex items-center gap-2">
                        {React.createElement(
                          Icons[themeOptions.find(t => t.value === entry.theme)?.icon || 'sun'],
                          { className: "h-4 w-4" }
                        )}
                        <p className="text-sm capitalize">{entry.theme}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}