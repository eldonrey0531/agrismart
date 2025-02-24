"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Bell, Mail, MessageSquare, Users, Store } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useProfile, type NotificationSettings } from "@/hooks/use-profile";

const notificationFormSchema = z.object({
  emailDigest: z.boolean(),
  marketplaceUpdates: z.boolean(),
  newMessages: z.boolean(),
  newConnections: z.boolean(),
  marketingEmails: z.boolean(),
  emailFrequency: z.enum(["immediate", "daily", "weekly"]),
});

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

interface NotificationsFormProps {
  initialSettings?: Partial<NotificationSettings>;
}

type NotificationItemId = Exclude<keyof NotificationSettings, 'emailFrequency'>;

const notificationItems = [
  {
    id: "emailDigest" as NotificationItemId,
    label: "Email Digest",
    description: "Receive a summary of your activities",
    icon: Mail,
  },
  {
    id: "marketplaceUpdates" as NotificationItemId,
    label: "Marketplace Updates",
    description: "Get notified about your marketplace listings",
    icon: Store,
  },
  {
    id: "newMessages" as NotificationItemId,
    label: "New Messages",
    description: "Receive notifications for new messages",
    icon: MessageSquare,
  },
  {
    id: "newConnections" as NotificationItemId,
    label: "Connection Requests",
    description: "Get notified about new connection requests",
    icon: Users,
  },
  {
    id: "marketingEmails" as NotificationItemId,
    label: "Marketing Emails",
    description: "Receive updates about new features and promotions",
    icon: Bell,
  },
];

export function NotificationsForm({ initialSettings }: NotificationsFormProps) {
  const { isLoading, updateNotifications } = useProfile();

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailDigest: true,
      marketplaceUpdates: true,
      newMessages: true,
      newConnections: true,
      marketingEmails: false,
      emailFrequency: "daily",
      ...initialSettings,
    },
  });

  // Auto-save when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (Object.keys(form.formState.dirtyFields).length > 0) {
        updateNotifications(value as NotificationSettings);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, updateNotifications]);

  return (
    <Form {...form}>
      <div className="space-y-8">
        {/* Email Notifications */}
        <div>
          <h3 className="mb-4 text-lg font-medium">Email Notifications</h3>
          <div className="space-y-4">
            {notificationItems.map((item) => (
              <FormField
                key={item.id}
                control={form.control}
                name={item.id}
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center">
                        <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                        <FormLabel>{item.label}</FormLabel>
                      </div>
                      <FormDescription>
                        {item.description}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <Separator />

        {/* Email Frequency */}
        <div>
          <h3 className="mb-4 text-lg font-medium">Email Frequency</h3>
          <FormField
            control={form.control}
            name="emailFrequency"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="space-y-2"
                    disabled={isLoading}
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="immediate" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Send notifications immediately
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="daily" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Daily digest at 9:00 AM
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="weekly" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Weekly digest every Monday
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {isLoading && (
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving changes...
          </div>
        )}
      </div>
    </Form>
  );
}