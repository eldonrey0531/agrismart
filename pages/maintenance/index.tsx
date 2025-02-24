import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ErrorDisplay } from '@/components/ui/error-display';
import { BrandLogo } from '@/components/ui/brand-logo';
import { CheckStatusButton } from '@/components/maintenance/check-status-button';

export const metadata: Metadata = {
  title: 'Maintenance Mode | AgriSmart',
  description: 'Our site is currently undergoing maintenance.',
};

export default function MaintenancePage() {
  // In production, you might want to check if maintenance is actually needed
  const isInMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
  const estimatedDuration = process.env.NEXT_PUBLIC_MAINTENANCE_DURATION || '1 hour';

  if (!isInMaintenance) {
    // Redirect to home if not in maintenance mode
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            System is operating normally
          </p>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const maintenanceMessage = `We're currently performing scheduled maintenance to improve our services. We expect to be back in ${estimatedDuration}.`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <BrandLogo className="h-12 w-12" asLink={false} />
          </div>
          <ErrorDisplay 
            error={maintenanceMessage}
            className="mb-6"
          />
          <h1 className="text-2xl font-bold mb-4">Under Maintenance</h1>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>
              For urgent matters, please contact our support team:
            </p>
            <p>
              <a 
                href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}
                className="text-primary hover:underline"
              >
                {process.env.NEXT_PUBLIC_CONTACT_EMAIL}
              </a>
            </p>
          </div>
          
          <div className="pt-4">
            <CheckStatusButton />
          </div>
        </div>
      </div>
    </div>
  );
}