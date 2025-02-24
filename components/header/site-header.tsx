import Link from 'next/link';
import { MainNav } from '@/components/header/main-nav';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { SecurityStatus } from '@/components/header/security-status';
import { UserNav } from '@/components/header/user-nav';
import { Logo } from '@/components/ui/logo';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Main site header component
 */
export function SiteHeader() {
  const { user, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Logo className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">
            AgriSmart
          </span>
        </Link>

        {/* Main Navigation */}
        <MainNav />

        {/* Right Side Actions */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          {isLoading ? (
            // Loading state
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-[100px]" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ) : user ? (
            // Authenticated state
            <div className="flex items-center space-x-4">
              <SecurityStatus />
              <ThemeToggle />
              <UserNav user={user} />
            </div>
          ) : (
            // Unauthenticated state
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
              {/* Mobile sign in */}
              <Link href="/login" className="sm:hidden">
                <Button variant="ghost" size="icon">
                  <span className="sr-only">Sign in</span>
                  <UserNav user={null} />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}