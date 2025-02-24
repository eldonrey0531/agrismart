/**
 * Mock data service for dashboard
 * Replace with real API calls in production
 */

// Activity data with realistic field activity patterns
export const activityData = {
  daily: {
    labels: ['12am', '4am', '8am', '12pm', '4pm', '8pm'],
    values: [12, 8, 15, 35, 28, 22],
  },
  weekly: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [45, 52, 49, 60, 55, 48, 50],
  },
  monthly: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    values: [180, 220, 205, 198],
  },
};

// Stats comparisons with previous period
export const statsComparisons = {
  fields: {
    current: 24,
    previous: 22,
    trend: 'up',
    percentage: 9.09,
  },
  crops: {
    current: 18,
    previous: 15,
    trend: 'up',
    percentage: 20,
  },
  tasks: {
    current: 45,
    previous: 52,
    trend: 'down',
    percentage: 13.46,
  },
  alerts: {
    current: 8,
    previous: 12,
    trend: 'down',
    percentage: 33.33,
  },
};

// Task status distribution
export const taskDistribution = {
  pending: 15,
  inProgress: 22,
  completed: 38,
  total: 75,
};

// Recent activity items
export interface ActivityItem {
  id: string;
  type: 'task' | 'alert' | 'update' | 'milestone';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  priority?: 'low' | 'medium' | 'high';
}

export const recentActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'task',
    title: 'Irrigation Check',
    description: 'Field B2 irrigation system maintenance completed',
    timestamp: '2024-02-19T10:30:00Z',
    status: 'completed',
    priority: 'high',
  },
  {
    id: '2',
    type: 'alert',
    title: 'Weather Alert',
    description: 'Heavy rain expected in the next 24 hours',
    timestamp: '2024-02-19T09:15:00Z',
    priority: 'high',
  },
  {
    id: '3',
    type: 'update',
    title: 'Crop Status',
    description: 'Wheat in Field A1 reaching maturity phase',
    timestamp: '2024-02-19T08:45:00Z',
  },
  {
    id: '4',
    type: 'milestone',
    title: 'Harvest Season',
    description: 'Corn harvest season starts next week',
    timestamp: '2024-02-19T07:20:00Z',
  },
];

// Weather forecast
export const weatherForecast = {
  current: {
    temp: 24,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
  },
  daily: [
    { day: 'Mon', temp: 24, condition: 'sunny' },
    { day: 'Tue', temp: 26, condition: 'partly-cloudy' },
    { day: 'Wed', temp: 23, condition: 'rain' },
    { day: 'Thu', temp: 22, condition: 'rain' },
    { day: 'Fri', temp: 25, condition: 'sunny' },
  ],
};

/**
 * Helper function to format trend percentages
 */
export function formatTrendValue(value: number, trend: 'up' | 'down'): string {
  return `${trend === 'up' ? '+' : '-'}${value.toFixed(1)}%`;
}

/**
 * Helper function to get trend description
 */
export function getTrendDescription(current: number, previous: number): string {
  const diff = current - previous;
  const percentage = (Math.abs(diff) / previous) * 100;
  const trend = diff >= 0 ? 'up' : 'down';
  return `${trend === 'up' ? '+' : '-'}${percentage.toFixed(1)}% since last period`;
}

/**
 * Usage Example:
 * 
 * // Get activity data
 * const weeklyActivity = activityData.weekly;
 * 
 * // Get stats with trends
 * const fieldStats = statsComparisons.fields;
 * console.log(formatTrendValue(fieldStats.percentage, fieldStats.trend));
 * 
 * // Get recent activity
 * const activities = recentActivity;
 * 
 * // Get weather
 * const weather = weatherForecast;
 */