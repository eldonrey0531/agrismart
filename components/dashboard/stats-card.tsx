'use client';

import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export interface StatsCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  className,
}: StatsCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            {icon && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {icon}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <h2 className="text-3xl font-bold">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </h2>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Usage Examples:
 * 
 * <StatsCard
 *   title="Total Users"
 *   value={1234}
 *   description="+12% from last month"
 *   icon={<Users className="h-4 w-4" />}
 * />
 * 
 * <StatsCard
 *   title="Revenue"
 *   value="$45,231"
 *   description="Current month"
 * />
 */