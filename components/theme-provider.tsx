'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  // After mounting, we have access to window
  React.useEffect(() => setMounted(true), []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      value={{
        light: "light",
        dark: "dark",
        system: "system",
      }}
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <div className={`
        min-h-screen font-sans antialiased
        bg-white dark:bg-[#030a06]
        text-[#2C5F2D] dark:text-[#E3FFED]
        transition-colors duration-300
        ${mounted ? '' : 'opacity-0'}
      `}>
        {/* Dark theme gradient overlay */}
        <div className="dark:fixed dark:inset-0 dark:z-[-1] dark:bg-gradient-to-b dark:from-[#030a06] dark:via-[#030905] dark:to-[#030a06]" />
        {children}
      </div>
    </NextThemesProvider>
  );
}

interface UseThemeReturn {
  theme: string | undefined;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  systemTheme: string | undefined;
  resolvedTheme: string | undefined;
  mounted: boolean;
  isDark: boolean;
  isSystem: boolean;
}

export function useTheme(): UseThemeReturn {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme, systemTheme, resolvedTheme } = useNextTheme();

  // After mounting, we have access to the theme
  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && (
    theme === 'dark' || 
    (theme === 'system' && systemTheme === 'dark')
  );

  const setPreferredTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme-preference', newTheme);
    }
  };

  // Load saved theme preference
  React.useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const savedTheme = window.localStorage.getItem('theme-preference');
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setTheme(savedTheme as 'light' | 'dark' | 'system');
      }
    }
  }, [mounted, setTheme]);

  return {
    theme,
    setTheme: setPreferredTheme,
    systemTheme,
    resolvedTheme,
    mounted,
    isDark,
    isSystem: theme === 'system',
  };
}