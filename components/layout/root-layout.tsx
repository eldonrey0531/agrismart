"use client";

import { usePathname } from "next/navigation";
import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

interface RootLayoutProps {
  children: React.ReactNode;
  className?: string;
  hideNav?: boolean;
  hideFooter?: boolean;
  withBackground?: boolean;
}

const backgroundPatterns = {
  default: (
    <>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-[100px]" />
      <div className="absolute inset-0">
        <div 
          className="absolute -top-[40%] -right-[40%] w-[80%] h-[80%] 
          rounded-full bg-gradient-to-br from-primary/20 to-accent/20 
          blur-[100px] animate-drift-slow"
        />
        <div 
          className="absolute -bottom-[40%] -left-[40%] w-[80%] h-[80%] 
          rounded-full bg-gradient-to-tr from-interactive/20 to-success/20 
          blur-[100px] animate-drift-reverse"
        />
      </div>
    </>
  ),
  grain: (
    <div 
      className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
      style={{ 
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
      }}
    />
  ),
};

export function RootLayout({
  children,
  className,
  hideNav = false,
  hideFooter = false,
  withBackground = true,
}: RootLayoutProps) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth") || 
    pathname?.startsWith("/login") || 
    pathname?.startsWith("/signup");

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Nature-inspired background patterns */}
      {withBackground && (
        <div 
          className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          {backgroundPatterns.default}
          {backgroundPatterns.grain}
        </div>
      )}

      {/* Layout structure */}
      <div className="flex flex-col flex-1">
        {/* Navigation */}
        {!hideNav && !isAuthPage && <MainNav />}

        {/* Main content */}
        <main
          className={cn(
            "flex-1",
            !hideNav && !isAuthPage && "pt-16", // Add padding for fixed nav
            className
          )}
        >
          {children}
        </main>

        {/* Footer */}
        {!hideFooter && !isAuthPage && <Footer />}
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}

// Layout wrapper for protected pages
export function ProtectedLayout({
  children,
  className,
  withNav = true,
}: {
  children: React.ReactNode;
  className?: string;
  withNav?: boolean;
}) {
  return (
    <RootLayout
      hideNav={!withNav}
      className={cn(
        "container mx-auto px-4 py-8 md:px-6 md:py-12 lg:py-16",
        className
      )}
    >
      {children}
    </RootLayout>
  );
}

// Layout wrapper for marketing pages
export function MarketingLayout({
  children,
  className,
  fullWidth = false,
}: {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <RootLayout
      className={cn(
        "flex flex-col items-center justify-center min-h-screen",
        !fullWidth && "container mx-auto px-4",
        className
      )}
    >
      {children}
    </RootLayout>
  );
}

// Layout wrapper for auth pages
export function AuthLayout({
  children,
  className,
  withBackground = true,
}: {
  children: React.ReactNode;
  className?: string;
  withBackground?: boolean;
}) {
  return (
    <RootLayout
      hideNav
      hideFooter
      withBackground={withBackground}
      className={cn(
        "flex flex-col items-center justify-center min-h-screen py-12 px-4",
        className
      )}
    >
      <div className="w-full max-w-md">
        {children}
      </div>
    </RootLayout>
  );
}

// Layout wrapper for error pages
export function ErrorLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <RootLayout
      hideNav
      hideFooter
      className={cn(
        "flex flex-col items-center justify-center min-h-screen p-4",
        className
      )}
    >
      {children}
    </RootLayout>
  );
}

export default RootLayout;