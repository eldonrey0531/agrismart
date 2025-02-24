"use client";

import React, { Component, ErrorInfo } from "react";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Home, 
  RefreshCcw, 
  LeafyGreen, 
  Sprout 
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by error boundary:", error, errorInfo);
    this.setState({ error, errorInfo });

    // Here you could send the error to your error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="relative mb-8">
              <div className="relative inline-block">
                {/* Glowing Background */}
                <div className="absolute -inset-4">
                  <div className="w-full h-full bg-destructive/20 blur-xl animate-pulse rounded-full" />
                </div>
                
                {/* Icon */}
                <div className="relative bg-background rounded-full p-4">
                  <AlertTriangle className="h-12 w-12 text-destructive animate-bounce-slow" />
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -inset-10 pointer-events-none">
                <LeafyGreen 
                  className="absolute top-0 left-0 w-6 h-6 text-accent/20 animate-float-slow" 
                />
                <Sprout 
                  className="absolute bottom-0 right-0 w-5 h-5 text-success/20 animate-float-reverse" 
                />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-semibold mb-2">
              Something Went Wrong
            </h1>
            <p className="text-muted-text mb-6">
              We've encountered an unexpected error. Like nature, sometimes things
              don't go as planned, but we can help you get back on track.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 text-left">
                <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 overflow-auto text-sm">
                  <p className="font-semibold text-destructive mb-2">
                    {this.state.error?.name}: {this.state.error?.message}
                  </p>
                  <pre className="text-xs text-muted-text whitespace-pre-wrap">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="w-full sm:w-auto group"
              >
                <RefreshCcw className={cn(
                  "mr-2 h-4 w-4 transition-transform",
                  "group-hover:rotate-180"
                )} />
                Try Again
              </Button>
              <Button
                asChild
                variant="default"
                className="w-full sm:w-auto group"
              >
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Return Home
                </Link>
              </Button>
            </div>

            {/* Support Link */}
            <p className="mt-8 text-sm text-muted-text">
              Need help?{" "}
              <Link 
                href="/contact" 
                className="text-accent hover:underline underline-offset-4"
              >
                Contact our support team
              </Link>
            </p>
          </div>

          {/* Natural Background */}
          <div className="fixed inset-0 -z-10 pointer-events-none">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-radial from-destructive/5 via-background to-background" />
            
            {/* Organic Pattern */}
            <div 
              className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, ${getComputedStyle(document.documentElement).getPropertyValue('--border')} 1px, transparent 0)`,
                backgroundSize: "32px 32px",
              }}
            />

            {/* Wave Pattern */}
            <div className="absolute bottom-0 left-0 right-0 h-64 overflow-hidden">
              <svg
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                className="absolute bottom-0 w-full h-full"
                fill="currentColor"
              >
                <path
                  d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                  className="text-border/10"
                />
              </svg>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;