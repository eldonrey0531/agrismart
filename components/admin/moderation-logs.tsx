import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarDateRangePicker } from '@/components/ui/date-range-picker';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { api } from '@/lib/api';

interface ModerationLog {
  id: string;
  contentId: string;
  content: {
    id: string;
    type: string;
    title: string;
  };
  moderatorId: string;
  moderator: {
    name: string;
    email: string;
  };
  action: string;
  reason: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface FilterState {
  action: string;
  contentType: string;
  moderator: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

/**
 * Moderation logs display component
 */
export function ModerationLogs() {
  const [filters, setFilters] = useState<FilterState>({
    action: 'all',
    contentType: 'all',
    moderator: 'all',
    dateRange: {
      from: null,
      to: null,
    },
  });

  // Fetch moderation logs
  const { data: logs = [], isLoading } = useQuery<ModerationLog[]>({
    queryKey: ['moderation-logs', filters],
    queryFn: () => api.get('/api/admin/moderation/logs', { params: filters }),
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'approved':
        return 'bg-green-500/10 text-green-500';
      case 'rejected':
        return 'bg-red-500/10 text-red-500';
      case 'removed':
        return 'bg-red-700/10 text-red-700';
      case 'flagged':
        return 'bg-orange-500/10 text-orange-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select
          value={filters.action}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, action: value }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="removed">Removed</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.contentType}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, contentType: value }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="post">Posts</SelectItem>
            <SelectItem value="comment">Comments</SelectItem>
            <SelectItem value="product">Products</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search moderator..."
          className="max-w-xs"
          value={filters.moderator}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, moderator: e.target.value }))
          }
        />

        <CalendarDateRangePicker
          date={filters.dateRange}
          onSelect={(range) =>
            setFilters((prev) => ({ ...prev, dateRange: range }))
          }
        />
      </div>

      {/* Logs Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Moderator</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead className="text-right">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap">
                {new Date(log.createdAt).toLocaleDateString()}
                <div className="text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{log.content.title}</div>
                <Badge variant="outline" className="mt-1">
                  {log.content.type}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getActionColor(log.action)}>
                  {log.action}
                </Badge>
              </TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="font-medium">{log.moderator.name}</div>
                  </TooltipTrigger>
                  <TooltipContent>{log.moderator.email}</TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell>
                <div className="max-w-[300px] truncate" title={log.reason}>
                  {log.reason}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {log.metadata && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // TODO: Show metadata details in a modal
                      console.log('Metadata:', log.metadata);
                    }}
                  >
                    View Details
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Empty State */}
      {logs.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No moderation logs found</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading moderation logs...</p>
        </div>
      )}
    </div>
  );
}