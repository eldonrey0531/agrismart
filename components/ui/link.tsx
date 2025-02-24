'use client';

import React from 'react';
import NextLink from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils/design-utils';

const linkVariants = cva(
  'inline-flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm',
  {
    variants: {
      variant: {
        default: 'text-primary hover:text-primary/80',
        muted: 'text-muted-text hover:text-foreground',
        accent: 'text-accent hover:text-accent/80',
        destructive: 'text-destructive hover:text-destructive/80',
        inherit: 'text-inherit hover:opacity-80',
      },
      size: {
        default: 'text-base',
        sm: 'text-sm',
        lg: 'text-lg',
      },
      underline: {
        none: '',
        hover: 'hover:underline underline-offset-4',
        always: 'underline underline-offset-4',
      },
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      underline: 'hover',
      weight: 'normal',
    },
  }
);

interface LinkProps extends VariantProps<typeof linkVariants> {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
  showExternalIcon?: boolean;
  prefetch?: boolean;
  scroll?: boolean;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  'aria-label'?: string;
}

export function Link({
  href,
  children,
  className,
  variant,
  size,
  underline,
  weight,
  external,
  showExternalIcon = true,
  prefetch,
  scroll,
  onClick,
  'aria-label': ariaLabel,
}: LinkProps) {
  // Determine if link is external based on href or explicit prop
  const isExternal = external || href.startsWith('http') || href.startsWith('mailto:');

  // Common props for both internal and external links
  const commonProps = {
    className: cn(linkVariants({ variant, size, underline, weight }), className),
    onClick,
    'aria-label': ariaLabel,
  };

  // External link specific props
  const externalProps = {
    rel: 'noopener noreferrer',
    target: '_blank',
  };

  if (isExternal) {
    return (
      <a
        href={href}
        {...commonProps}
        {...externalProps}
      >
        {children}
        {showExternalIcon && (
          <ExternalLink
            className="h-4 w-4"
            aria-hidden="true"
          />
        )}
      </a>
    );
  }

  return (
    <NextLink
      href={href}
      prefetch={prefetch}
      scroll={scroll}
      {...commonProps}
    >
      {children}
    </NextLink>
  );
}

// Pre-configured variants
export function MutedLink(props: LinkProps) {
  return <Link variant="muted" {...props} />;
}

export function AccentLink(props: LinkProps) {
  return <Link variant="accent" {...props} />;
}

export function InheritLink(props: LinkProps) {
  return <Link variant="inherit" underline="none" {...props} />;
}

export default Object.assign(Link, {
  Muted: MutedLink,
  Accent: AccentLink,
  Inherit: InheritLink,
});