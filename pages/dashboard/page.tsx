'use client';

import { useAuth } from '@/hooks/use-auth';
import { ButtonWrapper } from '@/components/ui/button-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#38FF7E]/20 to-transparent animate-pulse" />
          <Icons.spinner className="h-12 w-12 animate-spin text-[#38FF7E]" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 p-8">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#244A32]/20 via-transparent to-[#172F21]/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#38FF7E]/5 via-transparent to-transparent" />
      </div>

      {/* Welcome Card */}
      <Card className="overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#244A32]/20 to-transparent" />
        <CardHeader className="relative">
          <CardTitle className="text-3xl bg-gradient-to-r from-[#E3FFED] to-[#38FF7E] bg-clip-text text-transparent">
            Welcome back, {user?.name}! 👋
          </CardTitle>
          <CardDescription className="text-[#E3FFED]/70 text-lg">
            You are logged in as {user?.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <p className="text-[#E3FFED]/70">
                Account Status: {' '}
                <span className={user?.isVerified ? 'text-[#38FF7E]' : 'text-yellow-400'}>
                  {user?.isVerified ? 'Verified ✓' : 'Pending Verification'}
                </span>
              </p>
              <p className="text-[#E3FFED]/70">
                Role: <span className="text-[#38FF7E]">{user?.role}</span>
              </p>
            </div>
            <ButtonWrapper
              variant="outline"
              onClick={logout}
              className="border-[#38FF7E]/10 hover:border-[#38FF7E]/30 text-[#E3FFED]/70 hover:text-[#E3FFED] transition-all duration-300"
            >
              Log out
            </ButtonWrapper>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#244A32]/10 to-transparent" />
        <CardHeader className="relative">
          <CardTitle className="text-2xl bg-gradient-to-r from-[#E3FFED] to-[#38FF7E] bg-clip-text text-transparent">
            Quick Actions
          </CardTitle>
          <CardDescription className="text-[#E3FFED]/70">
            Common tasks and actions you can take
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Icons.user,
                title: 'View Profile',
                description: 'Update your personal information',
              },
              {
                icon: Icons.settings,
                title: 'Settings',
                description: 'Manage your account settings',
              },
              {
                icon: Icons.help,
                title: 'Help & Support',
                description: 'Get help with your account',
              },
            ].map((action, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#244A32]/30 to-[#172F21]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative space-y-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#244A32] to-[#172F21] group-hover:drop-shadow-[0_0_8px_rgba(56,255,126,0.3)] transition-all duration-300">
                    <action.icon className="h-6 w-6 text-[#38FF7E]" />
                  </div>
                  <h3 className="text-lg font-medium text-[#E3FFED] group-hover:text-[#38FF7E] transition-colors duration-300">
                    {action.title}
                  </h3>
                  <p className="text-sm text-[#E3FFED]/70">
                    {action.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#244A32]/5 to-transparent" />
          <CardHeader className="relative">
            <CardTitle className="text-2xl bg-gradient-to-r from-[#E3FFED] to-[#38FF7E] bg-clip-text text-transparent">
              Debug Information
            </CardTitle>
            <CardDescription className="text-[#E3FFED]/70">
              Available in development mode only
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <pre className="whitespace-pre-wrap rounded-lg bg-[#0E1B13]/50 p-4 text-sm text-[#E3FFED]/70 backdrop-blur-sm">
              {JSON.stringify(user, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}