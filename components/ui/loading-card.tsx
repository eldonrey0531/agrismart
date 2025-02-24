import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingCardProps {
  title?: {
    width?: string;
    height?: string;
  };
  description?: {
    width?: string;
    height?: string;
  };
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function LoadingCard({
  title = { width: "120px", height: "6" },
  description = { width: "250px", height: "4" },
  children,
  className,
  contentClassName,
}: LoadingCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <Skeleton className={`h-${title.height} w-[${title.width}]`} />
        {description && (
          <Skeleton className={`h-${description.height} w-[${description.width}]`} />
        )}
      </CardHeader>
      <CardContent className={cn("space-y-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

/**
 * Usage Examples:
 * 
 * // Basic usage
 * <LoadingCard>
 *   <Skeleton className="h-[200px]" />
 * </LoadingCard>
 * 
 * // Custom dimensions
 * <LoadingCard
 *   title={{ width: "150px", height: "8" }}
 *   description={{ width: "300px", height: "4" }}
 * >
 *   <Skeleton className="h-[100px]" />
 * </LoadingCard>
 * 
 * // Without description
 * <LoadingCard description={null}>
 *   <Skeleton className="h-[150px]" />
 * </LoadingCard>
 * 
 * // With custom spacing
 * <LoadingCard contentClassName="space-y-6">
 *   <Skeleton className="h-4 w-[200px]" />
 *   <Skeleton className="h-4 w-[180px]" />
 * </LoadingCard>
 */

/**
 * Common Loading Patterns
 */

interface LoadingFieldProps {
  label?: {
    width?: string;
    height?: string;
  };
  input?: {
    width?: string;
    height?: string;
  };
}

export function LoadingField({
  label = { width: "100px", height: "4" },
  input = { width: "full", height: "9" },
}: LoadingFieldProps) {
  return (
    <div className="space-y-2">
      <Skeleton className={`h-${label.height} w-[${label.width}]`} />
      <Skeleton className={`h-${input.height} w-${input.width}`} />
    </div>
  );
}

export function LoadingSwitch() {
  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="space-y-1">
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-3 w-[200px]" />
      </div>
      <Skeleton className="h-5 w-9" />
    </div>
  );
}

export function LoadingButton({
  width = "120px",
  height = "9",
}: {
  width?: string;
  height?: string;
}) {
  return <Skeleton className={`h-${height} w-[${width}]`} />;
}