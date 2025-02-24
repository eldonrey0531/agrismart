'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ActivityChartProps {
  className?: string;
  title?: string;
  data?: {
    labels: string[];
    values: number[];
  };
}

export function ActivityChart({
  className,
  title = 'Activity Overview',
  data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [65, 59, 80, 81, 56, 55, 70],
  },
}: ActivityChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Activity',
        data: data.values,
        fill: true,
        backgroundColor: 'hsl(var(--primary) / 0.1)',
        borderColor: 'hsl(var(--primary))',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: 'hsl(var(--primary))',
        pointBorderColor: 'hsl(var(--background))',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'hsl(var(--background))',
        titleColor: 'hsl(var(--foreground))',
        bodyColor: 'hsl(var(--muted-foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
        padding: 8,
      },
    },
    hover: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: 'hsl(var(--border) / 0.1)',
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          padding: 8,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          padding: 8,
        },
      },
    },
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Line options={options} data={chartData} />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Usage Example:
 * 
 * <ActivityChart
 *   title="Weekly Activity"
 *   data={{
 *     labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
 *     values: [65, 59, 80, 81, 56, 55, 70],
 *   }}
 *   className="mt-4"
 * />
 */