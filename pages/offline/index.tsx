"use client";

import { OfflineFallback } from "@/components/pwa/offline-fallback";
import { Button } from "@/components/ui/button";
import { Cloud, LeafyGreen, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OfflinePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-radial from-accent/5 via-background to-background" />
        <div 
          className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${getComputedStyle(document.documentElement).getPropertyValue('--border')} 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Content */}
      <div className="container max-w-3xl mx-auto px-4 py-12 flex flex-col items-center">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            {/* Icon Background Glow */}
            <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-background rounded-full p-6">
              <Cloud className="h-16 w-16 text-destructive" />
            </div>

            {/* Decorative Elements */}
            <LeafyGreen 
              className="absolute -left-4 -top-4 h-8 w-8 text-accent/20 animate-float-slow" 
            />
            <Sprout 
              className="absolute -right-4 -bottom-4 h-8 w-8 text-success/20 animate-float-reverse" 
            />
          </div>

          <h1 className="text-3xl font-bold mb-2">
            You're Currently Offline
          </h1>
          <p className="text-muted-text max-w-lg mx-auto">
            Like a plant during drought, we're waiting for connectivity to return.
            Don't worry, your data is safely stored and will sync when you're back online.
          </p>
        </div>

        {/* Main Content */}
        <div className="w-full space-y-8">
          {/* Available Actions */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-6 rounded-lg border border-border bg-surface/50 space-y-4">
              <h3 className="font-semibold">Available Offline</h3>
              <ul className="space-y-2 text-sm text-muted-text">
                <li>• View cached dashboard data</li>
                <li>• Access saved reports</li>
                <li>• Review stored analytics</li>
                <li>• Check local notifications</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border border-border bg-surface/50 space-y-4">
              <h3 className="font-semibold">Currently Unavailable</h3>
              <ul className="space-y-2 text-sm text-muted-text">
                <li>• Real-time sensor updates</li>
                <li>• New data synchronization</li>
                <li>• Remote device control</li>
                <li>• Live collaboration</li>
              </ul>
            </div>
          </div>

          {/* Offline Fallback Component */}
          <OfflineFallback
            message="We'll keep your data in sync and notify you when connection is restored."
            actionLabel="Check Connection"
            className="border border-border"
          />

          {/* Additional Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="group"
            >
              <Cloud className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
              Refresh Page
            </Button>
            <Button
              variant="default"
              onClick={() => window.history.back()}
              className="group"
            >
              Go Back
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-center text-sm text-muted-text">
            Need help? Visit our{" "}
            <a 
              href="/help/offline"
              className="text-accent hover:underline underline-offset-4"
            >
              offline guide
            </a>
            {" "}for more information.
          </p>
        </div>
      </div>
    </div>
  );
}