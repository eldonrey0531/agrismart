import { Metadata } from 'next';
import { ProfileLayout } from '@/components/profile/profile-layout';

export const metadata: Metadata = {
  title: 'Profile | AgriSmart Platform',
  description: 'Manage your profile settings and preferences',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProfileLayout>{children}</ProfileLayout>;
}