"use client";

import { useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface ProfileSectionProps {
  user: {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
}

export function ProfileSection({ user }: ProfileSectionProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  if (!user?.id) {
    return null;
  }

  const handleUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', 'avatar');
    formData.append('filename', `avatar-${user.id}-${Date.now()}`);

    try {
      setIsUploading(true);
      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      // Update user profile with new avatar
      const updateResponse = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId: data.fileId,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update profile');
      }

      toast({
        title: 'Success',
        description: 'Profile picture updated successfully',
      });

      // Force a page reload to show new avatar
      window.location.reload();

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile picture',
        variant: 'destructive',
      });
      console.error('Avatar upload error:', error);
    } finally {
      setIsUploading(false);
    }
  }, [user.id, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
              <AvatarFallback>{user.name?.[0] ?? "U"}</AvatarFallback>
            </Avatar>
            
            <div className="mt-2 flex flex-col items-center">
              <Button
                variant="outline"
                size="sm"
                disabled={isUploading}
                className="relative"
                onClick={() => document.getElementById('avatar-upload')?.click()}
              >
                {isUploading ? 'Uploading...' : 'Change Photo'}
              </Button>
              <input
                id="avatar-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleUpload}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                JPEG, PNG or WebP. Max 5MB.
              </p>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-xl font-semibold">{user.name ?? "Anonymous"}</h3>
            <p className="text-sm text-muted-foreground">{user.email ?? "No email"}</p>
          </div>
        </div>

        <div className="grid gap-4">
          <div>
            <h4 className="text-sm font-medium">Account ID</h4>
            <p className="text-sm text-muted-foreground">{user.id}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium">Email Verification</h4>
            <p className="text-sm text-muted-foreground">
              {user.email ? "Verified" : "Not verified"}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              toast({
                title: "Coming soon",
                description: "Profile editing will be available soon!",
              });
            }}
          >
            Edit Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
