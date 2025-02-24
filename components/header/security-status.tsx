import { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { Shield, Settings, AlertTriangle, Info } from 'lucide-react';
import { PasswordStatus } from '@/components/security/password-status';
import { usePasswordRecommendations } from '@/hooks/use-password-security';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface PopoverRenderProps {
  open: boolean;
  close: () => void;
}

/**
 * Security status header component
 */
export function SecurityStatus() {
  return (
    <Popover className="relative">
      {({ open, close }: PopoverRenderProps) => (
        <>
          <Popover.Button
            className={cn(
              'flex items-center gap-2 rounded-md p-2 text-sm font-medium',
              'hover:bg-accent hover:text-accent-foreground',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              open && 'bg-accent'
            )}
          >
            <PasswordStatus size="sm" showNotifications={false} />
          </Popover.Button>

          <Transition
            as={Fragment}
            show={open}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel 
              static
              className="absolute right-0 z-10 mt-3 w-screen max-w-sm transform px-4 sm:px-0"
            >
              <SecurityPopoverContent onClose={close} />
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

interface SecurityPopoverContentProps {
  onClose: () => void;
}

/**
 * Popover content with security details
 */
function SecurityPopoverContent({ onClose }: SecurityPopoverContentProps) {
  const { recommendations, requiresAction } = usePasswordRecommendations();

  return (
    <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 dark:ring-white/5">
      <div className="relative bg-background p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Security Status</h3>
          <Link 
            href="/settings/security" 
            onClick={onClose}
            className="hover:no-underline"
          >
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>

        {/* Main status indicator */}
        <div className="mb-6">
          <PasswordStatus size="lg" showNotifications={false} />
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Info className="h-4 w-4" />
              Recommendations
            </h4>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <Shield className="h-4 w-4 mt-0.5 shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex flex-col gap-2">
          <Link 
            href="/settings/security/password"
            onClick={onClose}
            className="hover:no-underline"
          >
            <Button 
              className="w-full justify-start" 
              variant={requiresAction ? "destructive" : "default"}
            >
              {requiresAction ? (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Update Password Now
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Review Security Settings
                </>
              )}
            </Button>
          </Link>
          <Link 
            href="/settings/security/2fa"
            onClick={onClose}
            className="hover:no-underline"
          >
            <Button variant="outline" className="w-full justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Enable Two-Factor Auth
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}