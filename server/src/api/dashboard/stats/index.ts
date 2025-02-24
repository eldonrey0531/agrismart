import { NextRequest } from 'next/server';
import { withAuth, withRateLimit } from '@/lib/api/protected-route';
import { httpResponse } from '@/lib/api-response';
import { ERROR_MESSAGES } from '@/lib/constants';
import type { DashboardStats } from '@/lib/types/api';

// Mock data (replace with real database queries in production)
const mockStats: DashboardStats = {
  totalFields: 12,
  activeCrops: 8,
  pendingTasks: 24,
  activeAlerts: 3,
};

// Mock data generation for demo purposes
function getUserStats(userId: string): DashboardStats {
  return {
    ...mockStats,
    // Add some variation based on user ID
    totalFields: mockStats.totalFields + (parseInt(userId) % 5),
    activeCrops: mockStats.activeCrops + (parseInt(userId) % 3),
    pendingTasks: mockStats.pendingTasks + (parseInt(userId) % 10),
    activeAlerts: mockStats.activeAlerts + (parseInt(userId) % 2),
  };
}

export const GET = withAuth(
  withRateLimit(
    async (req: NextRequest, { user }) => {
      try {
        // Get user-specific stats
        const stats = getUserStats(user.id);

        // Return stats with cache headers for 5 minutes
        return httpResponse.ok(
          { stats },
          {
            'Cache-Control': 'private, max-age=300',
          }
        );
      } catch (error) {
        console.error('Dashboard stats error:', error);
        return httpResponse.internalError(ERROR_MESSAGES.SERVER);
      }
    },
    {
      // Custom rate limit: 60 requests per minute
      limit: 60,
      window: 60000,
    }
  )
);

// Allow POST requests to refresh stats
export const POST = withAuth(
  async (req: NextRequest, { user }) => {
    try {
      // In production, this would trigger a refresh of the stats
      // from the database or external services
      const stats = getUserStats(user.id);

      return httpResponse.ok(
        { stats },
        {
          'Cache-Control': 'no-cache',
        }
      );
    } catch (error) {
      console.error('Dashboard stats refresh error:', error);
      return httpResponse.internalError(ERROR_MESSAGES.SERVER);
    }
  }
);