'use client';

import { useState } from 'react';
import { useForm, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormField } from '@/components/ui/form';
import { FormInput } from '@/components/ui/form-input';
import {
  userProfileSchema,
  UserProfileData,
  userProfileDefaultValues,
} from '@/lib/validations/profile-schema';

interface UserProfileManagerProps {
  initialData?: Partial<UserProfileData>;
  onSave: (data: UserProfileData) => Promise<void>;
  onCancel: () => void;
}

export function UserProfileManager({
  initialData,
  onSave,
  onCancel,
}: UserProfileManagerProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<UserProfileData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      ...userProfileDefaultValues,
      ...initialData,
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('avatar', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (data: UserProfileData) => {
    setIsSaving(true);
    try {
      await onSave(data);
    } catch (error) {
      console.error('Failed to save profile:', error);
      form.setError('root', {
        type: 'manual',
        message: 'Failed to save profile. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Profile Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Profile Information</h3>
          
          {/* Avatar Upload */}
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile preview"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="h-full w-full rounded-full bg-muted" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-white cursor-pointer hover:bg-primary/90"
              >
                📷
              </label>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Upload a new avatar</p>
              <p>JPG, PNG or GIF (max. 2MB)</p>
            </div>
          </div>

          <FormInput
            name="displayName"
            label="Display Name"
            placeholder="Your display name"
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  {...field}
                  className="min-h-[100px] w-full rounded-md border border-input px-3 py-2"
                  placeholder="Tell us about yourself..."
                />
              </div>
            )}
          />

          <FormInput
            name="location"
            label="Location"
            placeholder="Your location"
          />

          <FormInput
            name="website"
            label="Website"
            type="url"
            placeholder="https://yourwebsite.com"
          />
        </div>

        {/* Email Notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Email Notifications</h3>
          <div className="space-y-2">
            {(Object.keys(userProfileDefaultValues.emailNotifications) as Array<keyof UserProfileData['emailNotifications']>).map((key) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...form.register(`emailNotifications.${key}`)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm">
                  {key.charAt(0).toUpperCase() + key.slice(1)} emails
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Privacy Settings</h3>
          
          <FormField
            control={form.control}
            name="privacySettings.profileVisibility"
            render={({ field }) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">Profile Visibility</label>
                <select
                  {...field}
                  className="w-full rounded-md border border-input px-3 py-2"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="connections">Connections Only</option>
                </select>
              </div>
            )}
          />

          <div className="space-y-2">
            {(['showEmail', 'showLocation'] as const).map((key) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...form.register(`privacySettings.${key}`)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm">
                  Show {key.replace('show', '')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Preferences</h3>
          
          <FormField
            control={form.control}
            name="preferences.theme"
            render={({ field }) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">Theme</label>
                <select
                  {...field}
                  className="w-full rounded-md border border-input px-3 py-2"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
            )}
          />

          <FormField
            control={form.control}
            name="preferences.language"
            render={({ field }) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">Language</label>
                <select
                  {...field}
                  className="w-full rounded-md border border-input px-3 py-2"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
            )}
          />

          <FormField
            control={form.control}
            name="preferences.timezone"
            render={({ field }) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">Timezone</label>
                <select
                  {...field}
                  className="w-full rounded-md border border-input px-3 py-2"
                >
                  {Intl.supportedValuesOf('timeZone').map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            )}
          />
        </div>

        {/* Form Error Message */}
        {form.formState.errors.root && (
          <div className="text-sm text-destructive" role="alert">
            {form.formState.errors.root.message}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSaving || !form.formState.isDirty}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default UserProfileManager;