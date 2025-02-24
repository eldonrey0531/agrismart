"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Sprout, 
  Download, 
  Smartphone, 
  Leaf, 
  CloudOff,
  Wifi 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

interface InstallPromptProps {
  className?: string;
  onInstalled?: () => void;
}

export function InstallPrompt({ className, onInstalled }: InstallPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('🌱 User accepted the install prompt');
      onInstalled?.();
    }

    // Clear the deferredPrompt for the next time
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  const features = [
    {
      icon: CloudOff,
      activeIcon: Wifi,
      title: "Works Offline",
      description: "Access your data even without internet, like a self-sustaining garden",
    },
    {
      icon: Smartphone,
      title: "Quick Access",
      description: "Launch directly from your home screen for instant gardening",
    },
    {
      icon: Leaf,
      title: "Native Experience",
      description: "Feels like a natural extension of your device's ecosystem",
    },
  ];

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className={cn("sm:max-w-md", className)}>
        <DialogHeader>
          {/* Nature-inspired install icon */}
          <div className="mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-success/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-background rounded-full p-4 inline-flex">
              <Sprout className="h-8 w-8 text-success animate-float-slow" />
            </div>
          </div>

          <DialogTitle>Plant AgriSmart on Your Device</DialogTitle>
          <DialogDescription>
            Add AgriSmart to your home screen for quick access and a seamless experience,
            like having a garden right at your fingertips.
          </DialogDescription>
        </DialogHeader>

        {/* Features List */}
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-lg bg-surface/50 border border-border group hover:bg-surface/80 transition-colors duration-300"
            >
              <div className="relative h-5 w-5 shrink-0 mt-0.5">
                <feature.icon 
                  className={cn(
                    "absolute inset-0 text-success transition-all duration-300",
                    "group-hover:opacity-0 group-hover:scale-75"
                  )}
                />
                {feature.activeIcon && (
                  <feature.activeIcon 
                    className={cn(
                      "absolute inset-0 text-success transition-all duration-300",
                      "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"
                    )}
                  />
                )}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-medium leading-none">{feature.title}</h4>
                <p className="text-sm text-muted-text">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setShowPrompt(false)}
            className="w-full sm:w-auto group"
          >
            <Leaf className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
            Maybe Later
          </Button>
          <Button
            variant="success"
            onClick={handleInstall}
            className="w-full sm:w-auto group"
          >
            <Download className="mr-2 h-4 w-4 transition-transform group-hover:-translate-y-1" />
            Install App
          </Button>
        </DialogFooter>

        {/* Decorative Elements */}
        <div className="absolute -z-10 inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-success/5 to-transparent blur-2xl" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-accent/5 to-transparent blur-2xl" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default InstallPrompt;