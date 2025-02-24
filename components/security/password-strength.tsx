import { Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  strength: 'weak' | 'medium' | 'strong';
  showIcon?: boolean;
  showLabel?: boolean;
  showBar?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Password strength indicator component
 */
export function PasswordStrength({
  strength,
  showIcon = true,
  showLabel = true,
  showBar = true,
  size = 'md',
  className
}: PasswordStrengthProps) {
  const colors = {
    weak: 'text-destructive',
    medium: 'text-yellow-500',
    strong: 'text-green-500'
  };

  const icons = {
    weak: XCircle,
    medium: AlertTriangle,
    strong: CheckCircle
  };

  const labels = {
    weak: 'Weak Password',
    medium: 'Moderate Strength',
    strong: 'Strong Password'
  };

  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const barSizes = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2'
  };

  const Icon = icons[strength];

  return (
    <div className={cn('space-y-2', sizes[size], className)}>
      <div className="flex items-center gap-2">
        {showIcon && (
          <Icon className={cn(iconSizes[size], colors[strength])} />
        )}
        {showLabel && (
          <span className={cn('font-medium', colors[strength])}>
            {labels[strength]}
          </span>
        )}
      </div>
      
      {showBar && (
        <div className="w-full bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'transition-all duration-500 ease-in-out rounded-full',
              barSizes[size],
              {
                'w-1/3 bg-destructive': strength === 'weak',
                'w-2/3 bg-yellow-500': strength === 'medium',
                'w-full bg-green-500': strength === 'strong'
              }
            )}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Password strength summary component
 */
export function PasswordStrengthSummary({
  strength,
  className
}: {
  strength: 'weak' | 'medium' | 'strong';
  className?: string;
}) {
  const summaries = {
    weak: {
      icon: XCircle,
      color: 'text-destructive',
      message: 'This password is too weak and needs improvement.'
    },
    medium: {
      icon: AlertTriangle,
      color: 'text-yellow-500',
      message: 'This password provides moderate security but could be stronger.'
    },
    strong: {
      icon: CheckCircle,
      color: 'text-green-500',
      message: 'This password provides strong security.'
    }
  };

  const { icon: Icon, color, message } = summaries[strength];

  return (
    <div className={cn('flex items-start gap-2', className)}>
      <Icon className={cn('h-5 w-5 mt-0.5', color)} />
      <div className="space-y-1">
        <p className={cn('font-medium', color)}>
          Password Strength: {strength.charAt(0).toUpperCase() + strength.slice(1)}
        </p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}