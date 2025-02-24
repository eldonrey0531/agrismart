"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Chrome,
  Smartphone,
  Apple,
  Monitor,
  Download,
  ArrowRight,
  Share2,
  MoreVertical,
  Plus,
  Menu,
  Sprout,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DeviceType = "android" | "ios" | "desktop" | "auto";

interface InstallGuideProps {
  className?: string;
  onInstall?: () => Promise<void>;
}

export function InstallGuide({ className, onInstall }: InstallGuideProps) {
  const [deviceType, setDeviceType] = useState<DeviceType>("auto");
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Detect device type
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setDeviceType("ios");
    } else if (/android/.test(ua)) {
      setDeviceType("android");
    } else {
      setDeviceType("desktop");
    }
  }, []);

  const handleInstall = async () => {
    if (!onInstall) return;
    
    setIsInstalling(true);
    try {
      await onInstall();
    } finally {
      setIsInstalling(false);
    }
  };

  const installSteps = {
    android: [
      {
        icon: Share2,
        title: "Tap Share",
        description: "Open Chrome's menu and tap 'Share'",
      },
      {
        icon: Plus,
        title: "Add to Home Screen",
        description: "Select 'Add to Home Screen' from the menu",
      },
      {
        icon: Sprout,
        title: "Complete Installation",
        description: "Tap 'Add' to plant AgriSmart on your device",
      },
    ],
    ios: [
      {
        icon: Share2,
        title: "Tap Share",
        description: "Tap the share button in Safari's menu",
      },
      {
        icon: Plus,
        title: "Add to Home Screen",
        description: "Scroll down and tap 'Add to Home Screen'",
      },
      {
        icon: Sprout,
        title: "Complete Installation",
        description: "Tap 'Add' to plant AgriSmart on your device",
      },
    ],
    desktop: [
      {
        icon: Menu,
        title: "Open Menu",
        description: "Click the three dots menu in Chrome",
      },
      {
        icon: Plus,
        title: "Install App",
        description: "Select 'Install AgriSmart' from the menu",
      },
      {
        icon: Sprout,
        title: "Complete Installation",
        description: "Click 'Install' to add AgriSmart to your system",
      },
    ],
  };

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Install AgriSmart
        </CardTitle>
        <CardDescription>
          Plant AgriSmart on your device for the best experience
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue={deviceType} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="android" className="space-x-2">
              <Smartphone className="h-4 w-4" />
              <span>Android</span>
            </TabsTrigger>
            <TabsTrigger value="ios" className="space-x-2">
              <Apple className="h-4 w-4" />
              <span>iOS</span>
            </TabsTrigger>
            <TabsTrigger value="desktop" className="space-x-2">
              <Monitor className="h-4 w-4" />
              <span>Desktop</span>
            </TabsTrigger>
          </TabsList>

          {Object.entries(installSteps).map(([platform, steps]) => (
            <TabsContent key={platform} value={platform} className="space-y-4">
              {/* Install Steps */}
              <div className="relative">
                {/* Step Connector */}
                <div className="absolute left-6 top-[40px] bottom-8 w-px bg-border" />

                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="relative flex items-start gap-4 pb-8 last:pb-0"
                  >
                    {/* Step Icon */}
                    <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-border bg-background">
                      <step.icon className="h-5 w-5 text-accent" />
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 pt-2">
                      <h4 className="text-sm font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-text mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Platform-specific Notes */}
              <div className="rounded-lg bg-surface/50 p-4 text-sm text-muted-text">
                <p className="flex items-center gap-2">
                  <Chrome className="h-4 w-4 shrink-0" />
                  {platform === "ios" ? (
                    "For the best experience, use Safari browser"
                  ) : platform === "android" ? (
                    "Works best with Chrome browser"
                  ) : (
                    "Supported in Chrome, Edge, and other Chromium browsers"
                  )}
                </p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleInstall}
          disabled={isInstalling}
          className="w-full group"
        >
          {isInstalling ? (
            <Sprout className="mr-2 h-4 w-4 animate-bounce" />
          ) : (
            <Download className="mr-2 h-4 w-4 transition-transform group-hover:-translate-y-1" />
          )}
          Install AgriSmart
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default InstallGuide;