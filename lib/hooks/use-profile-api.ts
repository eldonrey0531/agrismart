import { useApi, useApiMutation, useApiDelete } from './use-api';
import { ProfileInput } from '@/lib/validations/form';
import { useQueryClient } from '@tanstack/react-query';

interface UserProfile extends ProfileInput {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
  isSeller: boolean;
  createdAt: string;
  updatedAt: string;
  sellerProfile?: {
    id: string;
    businessName: string;
    businessAddress: string;
    isVerified: boolean;
    rating: number;
    totalSales: number;
  };
}

interface SellerVerificationInput {
  businessName: string;
  businessAddress: string;
  governmentId: File;
  additionalDocuments?: File[];
}

export function useProfileApi() {
  const queryClient = useQueryClient();

  // Get current user profile
  const getProfile = () => 
    useApi<UserProfile>(['profile'], '/profile');

  // Update profile
  const updateProfile = useApiMutation<UserProfile, Partial<ProfileInput>>(
    '/profile',
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['profile']);
      },
    }
  );

  // Upload avatar
  const uploadAvatar = useApiMutation<
    { avatar: { url: string; alt: string } },
    FormData
  >('/profile/avatar', {
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
    },
  });

  // Delete avatar
  const deleteAvatar = useApiDelete<{ message: string }>(
    '/profile/avatar',
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['profile']);
      },
    }
  );

  // Change password
  const changePassword = useApiMutation<
    { message: string },
    {
      currentPassword: string;
      newPassword: string;
    }
  >('/profile/password');

  // Request seller verification
  const requestSellerVerification = useApiMutation<
    { message: string },
    SellerVerificationInput
  >('/profile/seller-verification', {
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
    },
  });

  // Get seller verification status
  const getSellerVerificationStatus = () =>
    useApi<{
      status: 'pending' | 'approved' | 'rejected';
      message?: string;
      updatedAt: string;
    }>(['seller-verification'], '/profile/seller-verification');

  // Update notification preferences
  const updateNotificationPreferences = useApiMutation<
    { message: string },
    {
      emailNotifications: boolean;
      pushNotifications: boolean;
      orderUpdates: boolean;
      marketingEmails: boolean;
    }
  >('/profile/notifications', {
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
    },
  });

  // Get notification preferences
  const getNotificationPreferences = () =>
    useApi<{
      emailNotifications: boolean;
      pushNotifications: boolean;
      orderUpdates: boolean;
      marketingEmails: boolean;
    }>(['notification-preferences'], '/profile/notifications');

  // Delete account
  const deleteAccount = useApiDelete<{ message: string }>(
    '/profile',
    {
      onSuccess: () => {
        // Clear all local storage and cached data
        localStorage.clear();
        queryClient.clear();
        window.location.href = '/';
      },
    }
  );

  return {
    getProfile,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    changePassword,
    requestSellerVerification,
    getSellerVerificationStatus,
    updateNotificationPreferences,
    getNotificationPreferences,
    deleteAccount,
  };
}

export default useProfileApi;