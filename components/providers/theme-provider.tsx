'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      forcedTheme="dark" // Force dark theme for our premium design system
      disableTransitionOnChange={false} // Enable smooth transitions
      {...props}
    >
      <div className="transition-colors duration-300 ease-in-out">
        {children}
      </div>
    </NextThemesProvider>
  );
}