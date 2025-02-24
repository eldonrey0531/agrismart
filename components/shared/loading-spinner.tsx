import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  centered?: boolean;
  text?: string;
}

export function LoadingSpinner({ 
  size = "md", 
  className,
  centered = false,
  text
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  const spinner = (
    <div className={cn(
      "flex items-center gap-3",
      centered && "justify-center",
      className
    )}>
      <Loader2 
        className={cn(
          "animate-spin text-primary",
          sizeClasses[size]
        )}
      />
      {text && (
        <span className={cn(
          "text-muted-foreground",
          textSizeClasses[size]
        )}>
          {text}
        </span>
      )}
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export function PageLoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}

export function CardLoadingSpinner() {
  return (
    <div className="p-8">
      <LoadingSpinner centered text="Loading..." />
    </div>
  );
}

export function ButtonLoadingSpinner() {
  return <LoadingSpinner size="sm" />;
}