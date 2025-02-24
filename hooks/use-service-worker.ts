"use client";

import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOffline: boolean;
  isOnline: boolean;
  registration: ServiceWorkerRegistration | null;
}

interface ServiceWorkerHook extends ServiceWorkerState {
  update: () => Promise<void>;
}

/**
 * Hook to manage service worker lifecycle and offline functionality
 */
export function useServiceWorker(): ServiceWorkerHook {
  const [swState, setSwState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isOffline: !navigator.onLine,
    isOnline: navigator.onLine,
    registration: null,
  });

  useEffect(() => {
    // Check if service workers are supported
    const isSupported = "serviceWorker" in navigator;
    setSwState(state => ({ ...state, isSupported }));

    if (!isSupported) {
      console.warn("🍂 Service workers are not supported in this environment");
      return;
    }

    // Register service worker
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        
        setSwState(state => ({ 
          ...state, 
          isRegistered: true,
          registration 
        }));

        toast({
          title: "Ready for Offline Use",
          description: "AgriSmart can now work without an internet connection",
          variant: "default",
        });

        // Listen for new service worker
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                toast({
                  title: "Update Available",
                  description: "A new version of AgriSmart is available. Refresh to update.",
                  variant: "default",
                });
              }
            });
          }
        });

      } catch (error) {
        console.error("🍂 Service Worker registration failed:", error);
        toast({
          title: "Offline Support Failed",
          description: "Could not enable offline functionality",
          variant: "destructive",
        });
      }
    };

    // Handle online/offline status
    const handleOnline = () => {
      setSwState(state => ({ ...state, isOffline: false, isOnline: true }));
      toast({
        title: "Back Online",
        description: "Your connection has been restored, like rain after drought",
        variant: "success",
      });
    };

    const handleOffline = () => {
      setSwState(state => ({ ...state, isOffline: true, isOnline: false }));
      toast({
        title: "You're Offline",
        description: "Working with limited functionality, like a garden in shade",
        variant: "warning",
      });
    };

    // Register service worker and event listeners
    void registerServiceWorker();
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Manual update function
  const update = async (): Promise<void> => {
    if (!swState.registration) return;

    try {
      await swState.registration.update();
      toast({
        title: "Checking for Updates",
        description: "Looking for new growth...",
        variant: "default",
      });
    } catch (error) {
      console.error("🍂 Service Worker update failed:", error);
      toast({
        title: "Update Failed",
        description: "Could not check for updates",
        variant: "destructive",
      });
    }
  };

  return {
    isSupported: swState.isSupported,
    isRegistered: swState.isRegistered,
    isOffline: swState.isOffline,
    isOnline: swState.isOnline,
    registration: swState.registration,
    update,
  };
}

export default useServiceWorker;