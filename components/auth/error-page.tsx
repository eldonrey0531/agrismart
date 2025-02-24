import { Fragment } from "react";
import Link from "next/link";
import { ChevronLeft, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: {
    text: string;
    href: string;
  };
  showBackToHome?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ErrorPage({
  title,
  description,
  icon: Icon,
  action,
  showBackToHome = true,
  className,
  children,
}: ErrorPageProps) {
  return (
    <div className={cn(
      "container flex items-center justify-center min-h-[600px] py-8",
      className
    )}>
      <div className="flex flex-col items-center space-y-8 text-center">
        {/* Icon and Text */}
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-muted rounded-full">
            <Icon className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter">{title}</h1>
          <p className="text-muted-foreground max-w-[400px]">
            {description}
          </p>
        </div>

        {/* Custom Content */}
        {children && (
          <div className="w-full max-w-[400px]">
            {children}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col items-center gap-4">
          {action && (
            <Link
              href={action.href}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              {action.text}
            </Link>
          )}
          {showBackToHome && (
            <Link
              href="/"
              className="inline-flex items-center justify-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;