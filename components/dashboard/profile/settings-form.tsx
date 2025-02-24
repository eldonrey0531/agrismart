import { useSettings } from '@/hooks/use-settings'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle } from 'lucide-react'
import type { Theme, UserSettings } from '@/types/settings'

export function SettingsForm() {
  const {
    settings,
    isLoading,
    isSaving,
    error,
    setTheme,
    setLanguage,
    updateNotifications,
    updatePrivacy,
    updateUIPreferences,
    toggleFeature
  } = useSettings()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error instanceof Error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Error Loading Settings
          </CardTitle>
          <CardDescription className="text-destructive">
            {error.message}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const handleThemeChange = (value: string) => {
    setTheme(value as Theme)
    toast({ description: 'Theme updated' })
  }

  const handleMotionChange = (checked: boolean) => {
    updateUIPreferences({ reducedMotion: checked })
    toast({ description: 'Motion preferences updated' })
  }

  const handleEmailNotificationsChange = (checked: boolean) => {
    updateNotifications({ email: checked })
    toast({ description: 'Email notification settings updated' })
  }

  const handlePushNotificationsChange = (checked: boolean) => {
    updateNotifications({ push: checked })
    toast({ description: 'Push notification settings updated' })
  }

  const handlePrivacyChange = (value: string) => {
    updatePrivacy({
      profileVisibility: value as UserSettings['privacy']['profileVisibility']
    })
    toast({ description: 'Privacy settings updated' })
  }

  const enableMaxPrivacy = () => {
    updatePrivacy({
      profileVisibility: 'private',
      activityVisibility: 'private',
      showOnlineStatus: false
    })
    toast({ description: 'Maximum privacy settings enabled' })
  }

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how the application looks and feels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={settings.theme}
              onValueChange={handleThemeChange}
            >
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reducedMotion">Reduced Motion</Label>
            <Switch
              id="reducedMotion"
              checked={settings.ui.reducedMotion}
              onCheckedChange={handleMotionChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Manage your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emailNotifications">Email Notifications</Label>
            <Switch
              id="emailNotifications"
              checked={settings.notifications.email}
              onCheckedChange={handleEmailNotificationsChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pushNotifications">Push Notifications</Label>
            <Switch
              id="pushNotifications"
              checked={settings.notifications.push}
              onCheckedChange={handlePushNotificationsChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
          <CardDescription>
            Control your privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profileVisibility">Profile Visibility</Label>
            <Select
              value={settings.privacy.profileVisibility}
              onValueChange={handlePrivacyChange}
            >
              <SelectTrigger id="profileVisibility">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="contacts">Contacts Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            disabled={isSaving}
            onClick={enableMaxPrivacy}
          >
            Enable Maximum Privacy
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}