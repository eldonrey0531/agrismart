import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

interface ReportedItem {
  id: string;
  contentId: string;
  content: {
    id: string;
    type: string;
    title: string;
    content: string;
    authorId: string;
    author: {
      name: string;
    };
  };
  reporterId: string;
  reporter: {
    name: string;
  };
  reason: string;
  details: string;
  createdAt: string;
  resolved: boolean;
}

/**
 * Reported content management component
 */
export function ReportedContent() {
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<ReportedItem | null>(null);
  const [moderationNote, setModerationNote] = useState('');

  // Fetch reported content
  const { data: reports = [], isLoading } = useQuery<ReportedItem[]>({
    queryKey: ['reported-content'],
    queryFn: () => api.get('/api/admin/reports'),
  });

  // Handle report resolution
  const { mutate: resolveReport } = useMutation({
    mutationFn: (data: { 
      reportId: string;
      action: 'remove' | 'approve' | 'reject';
      note: string;
    }) => api.post('/api/admin/reports/resolve', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reported-content'] });
      setSelectedReport(null);
      setModerationNote('');
      toast({
        title: 'Report resolved',
        description: 'The reported content has been moderated.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to resolve the report. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Reporter</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>
                <Badge variant="outline">{report.content.type}</Badge>
              </TableCell>
              <TableCell>
                <div className="font-medium">{report.content.title}</div>
                <div className="text-sm text-muted-foreground line-clamp-1">
                  {report.content.content}
                </div>
                <div className="text-xs text-muted-foreground">
                  by {report.content.author.name}
                </div>
              </TableCell>
              <TableCell>{report.reporter.name}</TableCell>
              <TableCell>
                <div className="font-medium">{report.reason}</div>
                <div className="text-sm text-muted-foreground line-clamp-1">
                  {report.details}
                </div>
              </TableCell>
              <TableCell>
                {new Date(report.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Badge
                  variant={report.resolved ? 'default' : 'destructive'}
                >
                  {report.resolved ? 'Resolved' : 'Pending'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedReport(report)}
                  disabled={report.resolved}
                >
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Reported Content</DialogTitle>
            <DialogDescription>
              Review and take action on the reported content
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Content</h4>
                <div className="rounded-md border p-4">
                  <div className="font-medium">{selectedReport.content.title}</div>
                  <p className="mt-1 text-sm">{selectedReport.content.content}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Report Details</h4>
                <div className="rounded-md border p-4 space-y-2">
                  <div>
                    <span className="text-sm font-medium">Reason: </span>
                    <span className="text-sm">{selectedReport.reason}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Details: </span>
                    <span className="text-sm">{selectedReport.details}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Moderation Note</h4>
                <Textarea
                  value={moderationNote}
                  onChange={(e) => setModerationNote(e.target.value)}
                  placeholder="Add a note about your moderation decision..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedReport(null)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => {
                if (selectedReport) {
                  resolveReport({
                    reportId: selectedReport.id,
                    action: 'approve',
                    note: moderationNote
                  });
                }
              }}
            >
              Approve Content
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedReport) {
                  resolveReport({
                    reportId: selectedReport.id,
                    action: 'remove',
                    note: moderationNote
                  });
                }
              }}
            >
              Remove Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}