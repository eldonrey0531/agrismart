'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

interface ThemeAnalyticsOptions {
  enableTracking?: boolean;
  storageKey?: string;
}

interface ThemeHistoryEntry {
  theme: string;
  timestamp: string;
}

interface ThemePreferences {
  history: ThemeHistoryEntry[];
  systemTheme: string | null;
  lastChanged: string | null;
}

export function useThemeAnalytics({
  enableTracking = true,
  storageKey = 'theme-preferences',
}: ThemeAnalyticsOptions = {}) {
  const { theme, systemTheme, setTheme } = useTheme();

  // Track theme changes
  useEffect(() => {
    if (!enableTracking) return;

    try {
      // Get stored preferences
      const storedPrefs = localStorage.getItem(storageKey);
      const preferences: ThemePreferences = storedPrefs ? JSON.parse(storedPrefs) : {
        history: [],
        systemTheme: null,
        lastChanged: null,
      };

      // Update preferences
      const now = new Date().toISOString();
      preferences.history = [
        ...preferences.history,
        {
          theme: theme || 'system',
          timestamp: now,
        },
      ].slice(-10); // Keep last 10 changes
      preferences.systemTheme = systemTheme || null;
      preferences.lastChanged = now;

      // Store updated preferences
      localStorage.setItem(storageKey, JSON.stringify(preferences));

      // Send analytics event (replace with your analytics service)
      if (process.env.NODE_ENV === 'production') {
        console.info('Theme changed:', {
          theme,
          systemTheme,
          timestamp: now,
        });
      }
    } catch (error) {
      console.error('Error tracking theme change:', error);
    }
  }, [theme, systemTheme, enableTracking, storageKey]);

  // Get theme preference history
  const getThemeHistory = (): ThemeHistoryEntry[] => {
    try {
      const storedPrefs = localStorage.getItem(storageKey);
      if (!storedPrefs) return [];
      const prefs: ThemePreferences = JSON.parse(storedPrefs);
      return prefs.history || [];
    } catch {
      return [];
    }
  };

  // Get most used theme
  const getMostUsedTheme = (): string | null => {
    try {
      const history = getThemeHistory();
      const themeCounts: Record<string, number> = history.reduce((acc, { theme }) => {
        acc[theme] = (acc[theme] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const sortedThemes = Object.entries(themeCounts)
        .sort(([, countA], [, countB]) => countB - countA);

      return sortedThemes[0]?.[0] || null;
    } catch {
      return null;
    }
  };

  // Set theme with fallback
  const setThemeWithFallback = (newTheme: string) => {
    try {
      setTheme(newTheme);
    } catch {
      // Fallback to basic theme setting if next-themes fails
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);
    }
  };

  return {
    currentTheme: theme,
    systemTheme,
    setTheme: setThemeWithFallback,
    getThemeHistory,
    getMostUsedTheme,
  } as const;
}

/**
 * Usage Example:
 * 
 * function ThemeManager() {
 *   const {
 *     currentTheme,
 *     systemTheme,
 *     setTheme,
 *     getThemeHistory,
 *     getMostUsedTheme,
 *   } = useThemeAnalytics();
 * 
 *   // Get user's theme preferences
 *   const themeHistory = getThemeHistory();
 *   const mostUsedTheme = getMostUsedTheme();
 * 
 *   return (
 *     <div>
 *       <p>Current theme: {currentTheme}</p>
 *       <p>System theme: {systemTheme}</p>
 *       <p>Most used theme: {mostUsedTheme}</p>
 *       <button onClick={() => setTheme('dark')}>Dark</button>
 *       <button onClick={() => setTheme('light')}>Light</button>
 *     </div>
 *   );
 * }
 */