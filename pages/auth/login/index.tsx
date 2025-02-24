import { Metadata } from 'next';
import { LoginPageContent } from '@/components/auth/login-page-content';

export const metadata: Metadata = {
  title: 'Login | AgriSmart Platform',
  description: 'Login to access your AgriSmart account',
};

export default function LoginPage() {
  return <LoginPageContent />;
}