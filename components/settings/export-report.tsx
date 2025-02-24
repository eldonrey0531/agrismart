'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileJson, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { downloadSecurityReport } from '@/lib/utils/security-export';
import type { SecurityStats, LoginEvent } from '@/hooks/use-security-analytics';

interface ExportReportProps {
  stats: SecurityStats;
  events: LoginEvent[];
  period: string;
}

export function ExportReport({ stats, events, period }: ExportReportProps) {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    try {
      setExporting(true);
      await downloadSecurityReport(stats, events, {
        format,
        period: `Last ${period} days`,
        includeGeoData: true,
        includeDeviceInfo: true
      });

      toast({
        title: 'Export Successful',
        description: `Security report exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export report',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  if (exporting) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Exporting...
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Choose Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <FileJson className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            toast({
              title: 'Coming Soon',
              description: 'PDF export will be available in a future update',
            });
          }}
          disabled
        >
          <FileText className="mr-2 h-4 w-4" />
          PDF (Coming Soon)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}