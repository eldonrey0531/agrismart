import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  usePasswordActionRequired, 
  usePasswordStrength 
} from '@/hooks/use-password-security';
import { Shield, AlertTriangle, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStatusProps {
  showNotifications?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Password security status indicator
 */
export function PasswordStatus({
  showNotifications = true,
  className,
  size = 'md'
}: PasswordStatusProps) {
  const { toast } = useToast();
  const { 
    requiresAction,
    message,
    isLoading: actionLoading
  } = usePasswordActionRequired();

  const {
    strength,
    recommendations,
    lastChanged,
    isLoading: strengthLoading
  } = usePasswordStrength();

  // Show notification when action is required
  useEffect(() => {
    if (showNotifications && requiresAction && message) {
      toast({
        title: 'Password Security Alert',
        description: message,
        variant: 'destructive',
        duration: 0, // Don't auto-dismiss
      });
    }
  }, [requiresAction, message, showNotifications, toast]);

  // Loading state
  if (actionLoading || strengthLoading) {
    return (
      <div className={cn(
        'animate-pulse flex items-center gap-2',
        sizeClasses[size],
        className
      )}>
        <div className="h-4 w-4 rounded-full bg-muted" />
        <div className="h-4 w-20 rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', sizeClasses[size], className)}>
      <StrengthIcon strength={strength} requiresAction={requiresAction} size={size} />
      <StrengthLabel strength={strength} requiresAction={requiresAction} size={size} />
      {size !== 'sm' && <StrengthBadge strength={strength} />}
    </div>
  );
}

/**
 * Strength-based icon
 */
function StrengthIcon({ 
  strength, 
  requiresAction,
  size = 'md'
}: {
  strength: string;
  requiresAction: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  if (requiresAction) {
    return (
      <AlertTriangle className={cn(
        'text-destructive animate-pulse',
        iconSizes[size]
      )} />
    );
  }

  switch (strength) {
    case 'strong':
      return <Shield className={cn('text-success', iconSizes[size])} />;
    case 'medium':
      return <Shield className={cn('text-warning', iconSizes[size])} />;
    case 'weak':
      return <AlertCircle className={cn('text-destructive', iconSizes[size])} />;
    default:
      return <Shield className={cn('text-muted-foreground', iconSizes[size])} />;
  }
}

/**
 * Strength-based label
 */
function StrengthLabel({
  strength,
  requiresAction,
  size = 'md'
}: {
  strength: string;
  requiresAction: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  if (requiresAction) {
    return (
      <span className="text-destructive font-medium">
        Action Required
      </span>
    );
  }

  return (
    <span className={cn(
      'font-medium',
      {
        'text-success': strength === 'strong',
        'text-warning': strength === 'medium',
        'text-destructive': strength === 'weak',
        'text-muted-foreground': !strength
      }
    )}>
      {strength.charAt(0).toUpperCase() + strength.slice(1)}
    </span>
  );
}

/**
 * Strength indicator badge
 */
function StrengthBadge({ strength }: { strength: string }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
      {
        'bg-success/10 text-success': strength === 'strong',
        'bg-warning/10 text-warning': strength === 'medium',
        'bg-destructive/10 text-destructive': strength === 'weak',
        'bg-muted text-muted-foreground': !strength
      }
    )}>
      {strength === 'strong' && <Check className="mr-1 h-3 w-3" />}
      {getStrengthLabel(strength)}
    </span>
  );
}

/**
 * Get descriptive strength label
 */
function getStrengthLabel(strength: string): string {
  switch (strength) {
    case 'strong':
      return 'Very Secure';
    case 'medium':
      return 'Could Be Stronger';
    case 'weak':
      return 'Needs Attention';
    default:
      return 'Unknown';
  }
}

/**
 * Size-based classes
 */
const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
} as const;

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
} as const;