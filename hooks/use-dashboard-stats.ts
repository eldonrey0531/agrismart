'use client';

import { useEffect } from 'react';
import { useAsync } from '@/hooks/use-async';
import { api } from '@/lib/api';
import type { DashboardStats } from '@/lib/types/api';

export function useDashboardStats(
  options: {
    refreshInterval?: number; // Refresh interval in milliseconds
    enabled?: boolean; // Whether to enable auto-refresh
  } = {}
) {
  const {
    refreshInterval = 30000, // Default to 30 seconds
    enabled = true,
  } = options;

  const {
    execute: fetchStats,
    data,
    error,
    isLoading,
    reset,
  } = useAsync<{ stats: DashboardStats }>(
    api.dashboard.getStats,
    {
      showErrorToast: true,
    }
  );

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchStats();
    }
    return () => reset();
  }, [enabled, fetchStats, reset]);

  // Set up auto-refresh
  useEffect(() => {
    if (!enabled || !refreshInterval) return;

    const intervalId = setInterval(() => {
      fetchStats();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [enabled, refreshInterval, fetchStats]);

  const refresh = async () => {
    return fetchStats();
  };

  return {
    stats: data?.stats,
    error,
    isLoading,
    refresh,
    // Derived stats for convenience
    totalFields: data?.stats.totalFields ?? 0,
    activeCrops: data?.stats.activeCrops ?? 0,
    pendingTasks: data?.stats.pendingTasks ?? 0,
    activeAlerts: data?.stats.activeAlerts ?? 0,
  };
}

// Example usage:
/*
function DashboardStats() {
  const { 
    stats,
    isLoading,
    error,
    refresh,
    totalFields,
    activeCrops,
    pendingTasks,
    activeAlerts,
  } = useDashboardStats({
    refreshInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return <div>Loading stats...</div>;
  }

  if (error) {
    return (
      <div>
        Error loading stats
        <button onClick={refresh}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={refresh}>Refresh Stats</button>
      <StatsCard title="Total Fields" value={totalFields} />
      <StatsCard title="Active Crops" value={activeCrops} />
      <StatsCard title="Pending Tasks" value={pendingTasks} />
      <StatsCard title="Active Alerts" value={activeAlerts} />
    </div>
  );
}
*/