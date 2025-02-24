import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-primary/10",
        className
      )}
      {...props}
    />
  );
}

/**
 * Usage Examples:
 * 
 * // Basic usage
 * <Skeleton className="h-4 w-[200px]" />
 * 
 * // Avatar placeholder
 * <Skeleton className="h-12 w-12 rounded-full" />
 * 
 * // Text block with multiple lines
 * <div className="space-y-2">
 *   <Skeleton className="h-4 w-[250px]" />
 *   <Skeleton className="h-4 w-[200px]" />
 * </div>
 * 
 * // Card skeleton
 * <div className="space-y-3">
 *   <Skeleton className="h-[125px] w-[250px] rounded-xl" />
 *   <div className="space-y-2">
 *     <Skeleton className="h-4 w-[250px]" />
 *     <Skeleton className="h-4 w-[200px]" />
 *   </div>
 * </div>
 * 
 * // With custom color
 * <Skeleton className="h-4 w-[200px] bg-red-100" />
 */
