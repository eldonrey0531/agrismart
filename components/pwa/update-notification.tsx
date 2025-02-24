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
import { useServiceWorker } from "@/hooks/use-service-worker";
import { LeafyGreen, RefreshCcw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpdateNotificationProps {
  className?: string;
}

export function UpdateNotification({ className }: UpdateNotificationProps) {
  const [showDialog, setShowDialog] = useState(false);
  const { isRegistered, update } = useServiceWorker();

  useEffect(() => {
    // Listen for new service worker updates
    if (!isRegistered || !navigator.serviceWorker) return;

    const handleStateChange = async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        setShowDialog(true);
      }
    };

    void handleStateChange();

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', () => {
        window.location.reload();
      });
    };
  }, [isRegistered]);

  const handleUpdate = async () => {
    await update();
    setShowDialog(false);
    window.location.reload();
  };

  if (!showDialog) return null;

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className={cn("sm:max-w-md", className)}>
        <DialogHeader>
          {/* Nature-inspired update icon */}
          <div className="mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-background rounded-full p-3 inline-flex">
              <LeafyGreen className="h-6 w-6 text-accent animate-float-slow" />
            </div>
          </div>

          <DialogTitle>New Growth Available</DialogTitle>
          <DialogDescription>
            A fresh update has blossomed! Refresh to experience the latest improvements.
          </DialogDescription>
        </DialogHeader>

        {/* Update Status Indicators */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-surface/50 border border-border">
          <AlertCircle className="h-5 w-5 text-accent shrink-0" />
          <div className="text-sm text-muted-text">
            Your app will briefly go offline while applying updates, like a plant
            resting before new growth.
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {/* Nature-themed buttons */}
          <Button
            variant="outline"
            onClick={() => setShowDialog(false)}
            className="w-full sm:w-auto"
          >
            Later
          </Button>
          <Button
            variant="accent"
            onClick={handleUpdate}
            className="w-full sm:w-auto group"
          >
            <RefreshCcw className="mr-2 h-4 w-4 transition-transform group-hover:rotate-180" />
            Update Now
          </Button>
        </DialogFooter>

        {/* Decorative Elements */}
        <div className="absolute -z-10 inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-accent/5 to-transparent blur-2xl" />
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-success/5 to-transparent blur-2xl" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateNotification;