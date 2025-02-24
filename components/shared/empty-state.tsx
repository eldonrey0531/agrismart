import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: "default" | "card" | "minimal";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = "default"
}: EmptyStateProps) {
  const Content = (
    <div
      className={cn(
        "flex flex-col items-center text-center space-y-4 p-8",
        className
      )}
    >
      {Icon && (
        <div className="rounded-full bg-muted p-3">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <div className="space-y-2">
        <h3 className="font-semibold tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-[150px] mx-auto">
            {description}
          </p>
        )}
      </div>
      {action && (
        <Button
          onClick={action.onClick}
          variant={variant === "card" ? "default" : "outline"}
          size="sm"
        >
          {action.label}
        </Button>
      )}
    </div>
  );

  if (variant === "minimal") {
    return Content;
  }

  if (variant === "card") {
    return (
      <div className="rounded-lg border bg-card text-card-foreground">
        {Content}
      </div>
    );
  }

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      {Content}
    </div>
  );
}

export function NoResults({
  searchQuery,
  onReset,
}: {
  searchQuery: string;
  onReset: () => void;
}) {
  return (
    <EmptyState
      variant="minimal"
      title="No results found"
      description={`No matches found for "${searchQuery}"`}
      action={{
        label: "Clear search",
        onClick: onReset,
      }}
    />
  );
}

export function NoData({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: EmptyStateProps["action"];
}) {
  return (
    <EmptyState
      variant="card"
      title={title}
      description={description}
      action={action}
    />
  );
}