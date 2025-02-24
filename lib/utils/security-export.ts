import { LoginEvent, SecurityStats } from '@/hooks/use-security-analytics';
import { format } from 'date-fns';

interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  period: string;
  includeGeoData?: boolean;
  includeDeviceInfo?: boolean;
}

type ExportData = {
  metadata: {
    generatedAt: string;
    period: string;
    totalEvents: number;
  };
  summary: Omit<SecurityStats, 'recentEvents' | 'loginTrends'>;
  events: LoginEvent[];
};

export function prepareSecurityReport(
  stats: SecurityStats,
  events: LoginEvent[],
  options: ExportOptions
): ExportData {
  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      period: options.period,
      totalEvents: events.length,
    },
    summary: {
      totalLogins: stats.totalLogins,
      failedAttempts: stats.failedAttempts,
      successRate: stats.successRate,
      uniqueDevices: stats.uniqueDevices,
      uniqueLocations: stats.uniqueLocations,
      lastFailedAttempt: stats.lastFailedAttempt,
      topLocations: stats.topLocations,
      topDevices: stats.topDevices,
    },
    events
  };
}

export function exportToCSV(data: ExportData): string {
  const rows: string[] = [];
  
  // Add metadata
  rows.push('Security Report');
  rows.push(`Generated: ${format(new Date(data.metadata.generatedAt), 'PPpp')}`);
  rows.push(`Period: ${data.metadata.period}`);
  rows.push('');

  // Add summary stats
  rows.push('Summary Statistics');
  rows.push(`Total Logins,${data.summary.totalLogins}`);
  rows.push(`Failed Attempts,${data.summary.failedAttempts}`);
  rows.push(`Success Rate,${data.summary.successRate.toFixed(2)}%`);
  rows.push(`Unique Devices,${data.summary.uniqueDevices}`);
  rows.push(`Unique Locations,${data.summary.uniqueLocations}`);
  rows.push('');

  // Add top locations
  rows.push('Top Locations');
  rows.push('Location,Count');
  data.summary.topLocations.forEach(loc => {
    rows.push(`${loc.location},${loc.count}`);
  });
  rows.push('');

  // Add top devices
  rows.push('Top Devices');
  rows.push('Device,Count');
  data.summary.topDevices.forEach(dev => {
    rows.push(`${dev.device},${dev.count}`);
  });
  rows.push('');

  // Add detailed events
  rows.push('Detailed Events');
  rows.push('Timestamp,Status,IP Address,Location,Device,Reason');
  data.events.forEach(event => {
    rows.push([
      format(new Date(event.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      event.status,
      event.ipAddress,
      event.location || 'Unknown',
      event.device || 'Unknown',
      event.reason || ''
    ].join(','));
  });

  return rows.join('\n');
}

export function exportToJSON(data: ExportData): string {
  return JSON.stringify(data, null, 2);
}

export async function downloadSecurityReport(
  stats: SecurityStats,
  events: LoginEvent[],
  options: ExportOptions
): Promise<void> {
  const data = prepareSecurityReport(stats, events, options);
  let content: string;
  let filename: string;
  let mimeType: string;

  // Format the content based on the requested format
  switch (options.format) {
    case 'csv':
      content = exportToCSV(data);
      filename = `security-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      mimeType = 'text/csv';
      break;
    case 'json':
      content = exportToJSON(data);
      filename = `security-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
      mimeType = 'application/json';
      break;
    case 'pdf':
      throw new Error('PDF export not implemented yet');
    default:
      throw new Error('Unsupported export format');
  }

  // Create and trigger download
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}