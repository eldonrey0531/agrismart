'use client';

import { Icons } from '@/components/ui/icons';
import { useAuth } from '@/contexts/auth-context';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  description: string;
}

const StatCard = ({ title, value, icon: Icon, description }: StatCardProps) => (
  <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <h3 className="text-sm font-medium">{title}</h3>
    </div>
    <div className="mt-3">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </div>
);

const stats = [
  {
    title: 'Total Fields',
    value: '12',
    icon: Icons.sprout,
    description: 'Active agricultural fields',
  },
  {
    title: 'Crop Types',
    value: '6',
    icon: Icons.chart,
    description: 'Different crops under cultivation',
  },
  {
    title: 'Recent Activities',
    value: '24',
    icon: Icons.calendar,
    description: 'Actions in the last 7 days',
  },
  {
    title: 'Team Members',
    value: '8',
    icon: Icons.users,
    description: 'Active collaborators',
  },
];

export function DashboardContent() {
  const { user } = useAuth();

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Welcome back, {user?.name}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Recent Activity</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Your recent farming activities will appear here.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Weather Forecast</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Local weather information will be displayed here.
          </p>
        </div>
      </div>
    </div>
  );
}