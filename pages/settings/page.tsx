"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Bell, Moon, Sun, Globe, Shield, Eye, Mail } from "lucide-react";

interface SettingsGroup {
  title: string;
  items: {
    id: string;
    label: string;
    description: string;
    defaultValue: boolean;
  }[];
}

const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    title: "Appearance",
    items: [
      {
        id: "dark-mode",
        label: "Dark Mode",
        description: "Use dark theme across the application",
        defaultValue: false,
      },
      {
        id: "reduce-motion",
        label: "Reduce Motion",
        description: "Minimize animations and transitions",
        defaultValue: false,
      },
    ],
  },
  {
    title: "Notifications",
    items: [
      {
        id: "email-notifications",
        label: "Email Notifications",
        description: "Receive updates via email",
        defaultValue: true,
      },
      {
        id: "push-notifications",
        label: "Push Notifications",
        description: "Enable browser notifications",
        defaultValue: true,
      },
      {
        id: "marketing-emails",
        label: "Marketing Emails",
        description: "Receive promotional content",
        defaultValue: false,
      },
    ],
  },
  {
    title: "Privacy",
    items: [
      {
        id: "public-profile",
        label: "Public Profile",
        description: "Make your profile visible to others",
        defaultValue: true,
      },
      {
        id: "show-activity",
        label: "Activity Status",
        description: "Show when you're active",
        defaultValue: true,
      },
    ],
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    SETTINGS_GROUPS.forEach((group) => {
      group.items.forEach((item) => {
        initial[item.id] = item.defaultValue;
      });
    });
    return initial;
  });

  const { toast } = useToast();

  const handleSettingChange = (id: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [id]: value }));
    toast({
      title: "Settings updated",
      description: "Your preferences have been saved.",
    });
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {SETTINGS_GROUPS.map((group) => (
          <TabsContent key={group.title} value={group.title.toLowerCase()}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {group.title === "Appearance" && <Sun className="w-5 h-5" />}
                  {group.title === "Notifications" && <Bell className="w-5 h-5" />}
                  {group.title === "Privacy" && <Shield className="w-5 h-5" />}
                  {group.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between space-x-2"
                  >
                    <div className="space-y-0.5">
                      <Label htmlFor={item.id}>{item.label}</Label>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Switch
                      id={item.id}
                      checked={settings[item.id]}
                      onCheckedChange={(value) =>
                        handleSettingChange(item.id, value)
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}