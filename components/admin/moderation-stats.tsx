import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

interface StatsData {
  contentStats: {
    status: string;
    _count: number;
  }[];
  reportStats: {
    total: number;
    resolved: number;
    pending: number;
  };
}

/**
 * Moderation statistics display component
 */
export function ModerationStats() {
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ['moderation-stats'],
    queryFn: () => api.get('/api/admin/moderation/stats'),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-8 bg-muted rounded w-3/4" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  const contentStats = stats?.contentStats || [];
  const reportStats = stats?.reportStats || { total: 0, resolved: 0, pending: 0 };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'approved':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      case 'flagged':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
      {/* Content Status Stats */}
      {contentStats.map((stat) => (
        <Card key={stat.status}>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.status.charAt(0).toUpperCase() + stat.status.slice(1)}
            </CardTitle>
            <div className={`text-2xl font-bold ${getStatusColor(stat.status)}`}>
              {stat._count}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Total {stat.status} items
            </p>
          </CardContent>
        </Card>
      ))}

      {/* Report Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Reports
          </CardTitle>
          <div className="text-2xl font-bold">
            {reportStats.total}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Resolved</span>
              <span className="text-green-500">{reportStats.resolved}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending</span>
              <span className="text-yellow-500">{reportStats.pending}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resolution Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Resolution Rate
          </CardTitle>
          <div className="text-2xl font-bold">
            {reportStats.total
              ? Math.round((reportStats.resolved / reportStats.total) * 100)
              : 0}%
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-2 bg-muted rounded overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{
                width: `${
                  reportStats.total
                    ? (reportStats.resolved / reportStats.total) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}