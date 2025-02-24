import { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { SettingsNav, SettingsMobileNav } from '@/components/settings/settings-nav';
import { BackButton } from '@/components/navigation/back-button';

export const metadata: Metadata = {
  title: {
    default: 'Settings',
    template: '%s | Settings'
  },
  description: 'Manage your account settings and preferences.',
};

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="container relative mx-auto flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:gap-10 px-4">
      {/* Back button - visible on mobile only */}
      <div className="sticky top-0 z-30 -mx-4 bg-background px-4 py-2 md:hidden">
        <BackButton href="/dashboard" label="Back to Dashboard" />
      </div>

      {/* Mobile navigation */}
      <div className="sticky top-14 z-30 -mx-4 overflow-x-auto bg-background px-4 pb-2 md:hidden">
        <SettingsMobileNav />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:block">
        <div className="sticky top-16 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Settings</h2>
            <p className="text-sm text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
          <Separator />
          <SettingsNav />
        </div>
      </aside>

      {/* Main content */}
      <main className="relative py-6 md:py-8 lg:py-10">
        <div className="mx-auto max-w-4xl">
          {children}
        </div>
      </main>
    </div>
  );
}

// Loading state
export function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="h-6 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
          <div className="h-8 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="space-y-4">
          <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
          <div className="h-8 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="space-y-4">
          <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
          <div className="h-8 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}

// Not found state
export function SettingsNotFound() {
  return (
    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <h3 className="mt-4 text-lg font-semibold">Setting Not Found</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          This settings page doesn't exist. Please check the URL and try again.
        </p>
        <BackButton href="/settings" label="Back to Settings" />
      </div>
    </div>
  );
}

// Error state
export function SettingsError() {
  return (
    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <h3 className="mt-4 text-lg font-semibold">Error Loading Settings</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          Something went wrong. Please try refreshing the page.
        </p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}