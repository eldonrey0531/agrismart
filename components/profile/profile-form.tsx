import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProfileInput, profileSchema } from '@/lib/validations/form';
import { Button } from '@/components/ui/button';
import { Form, FormField } from '@/components/ui/form';
import { FormInput } from '@/components/ui/form-input';

interface ProfileFormProps {
  onSubmit: (data: ProfileInput) => Promise<void>;
  initialData?: Partial<ProfileInput>;
  isLoading?: boolean;
}

export function ProfileForm({
  onSubmit,
  initialData,
  isLoading = false,
}: ProfileFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialData?.avatar?.url || null
  );

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData?.name || '',
      bio: initialData?.bio || '',
      location: initialData?.location || '',
      phoneNumber: initialData?.phoneNumber || '',
      avatar: initialData?.avatar,
    },
    mode: 'onChange',
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleSubmit = async (data: ProfileInput) => {
    try {
      setError(null);

      // If there's a new avatar, upload it first
      if (avatarFile) {
        // TODO: Implement actual image upload
        const fakeUrl = URL.createObjectURL(avatarFile);
        data.avatar = {
          url: fakeUrl,
          alt: avatarFile.name,
        };
      }

      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-8"
        noValidate
      >
        {/* Avatar Upload */}
        <div className="space-y-4">
          <label className="text-sm font-medium">Profile Picture</label>
          <div className="flex items-center gap-6">
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
                disabled={isLoading}
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-white cursor-pointer hover:bg-primary/90"
              >
                📷
              </label>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Upload a new profile picture</p>
              <p>JPG, PNG or GIF (max. 2MB)</p>
            </div>
          </div>
        </div>

        <FormInput
          name="name"
          label="Full Name"
          disabled={isLoading}
          placeholder="Your full name"
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <textarea
                {...field}
                className="min-h-[100px] w-full rounded-md border border-input px-3 py-2 text-sm"
                placeholder="Tell us about yourself..."
                disabled={isLoading}
              />
            </div>
          )}
        />

        <FormInput
          name="location"
          label="Location"
          disabled={isLoading}
          placeholder="Your location"
        />

        <FormInput
          name="phoneNumber"
          label="Phone Number"
          type="tel"
          disabled={isLoading}
          placeholder="+1234567890"
        />

        {error && (
          <div className="text-sm text-destructive" role="alert">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => {
              form.reset(initialData);
              setAvatarPreview(initialData?.avatar?.url || null);
              setAvatarFile(null);
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !form.formState.isValid}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default ProfileForm;