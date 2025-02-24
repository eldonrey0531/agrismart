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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import type { ModerationStatus } from '@/lib/community/access-control';

interface ContentItem {
  id: string;
  type: 'post' | 'comment' | 'product';
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  status: ModerationStatus;
  reportCount?: number;
}

interface ModerationAction {
  status: ModerationStatus;
  reason: string;
}

interface ContentModerationProps {
  status?: ModerationStatus;
}

export function ContentModeration({ status = 'pending' }: ContentModerationProps) {
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>('all');

  // Fetch content items
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['moderation-queue', status, filterType],
    queryFn: () => api.get(`/api/admin/moderation?status=${status}&type=${filterType}`),
  });

  // Moderate content mutation
  const { mutate: moderateContent } = useMutation({
    mutationFn: (data: { ids: string[]; action: ModerationAction }) =>
      api.patch('/api/admin/moderate', data),
    onSuccess: () => {
      toast({
        title: 'Content moderated',
        description: 'The selected items have been moderated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      setSelectedItems([]);
    },
    onError: (error) => {
      toast({
        title: 'Moderation failed',
        description: 'Failed to moderate content. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle bulk moderation
  const handleBulkModerate = (action: ModerationAction) => {
    if (selectedItems.length === 0) return;
    moderateContent({ ids: selectedItems, action });
  };

  // Toggle item selection
  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Select
            value={filterType}
            onValueChange={setFilterType}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Content</SelectItem>
              <SelectItem value="post">Posts</SelectItem>
              <SelectItem value="comment">Comments</SelectItem>
              <SelectItem value="product">Products</SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            placeholder="Search content..."
            className="max-w-sm"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={selectedItems.length === 0}
            onClick={() => handleBulkModerate({ status: 'approved', reason: 'Content meets guidelines' })}
          >
            Approve Selected
          </Button>
          <Button
            variant="destructive"
            disabled={selectedItems.length === 0}
            onClick={() => handleBulkModerate({ status: 'rejected', reason: 'Content violates guidelines' })}
          >
            Reject Selected
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <input
                type="checkbox"
                onChange={(e) => {
                  setSelectedItems(
                    e.target.checked ? items.map((item: ContentItem) => item.id) : []
                  );
                }}
                checked={selectedItems.length === items.length}
              />
            </TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reports</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item: ContentItem) => (
            <TableRow key={item.id}>
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleItemSelection(item.id)}
                />
              </TableCell>
              <TableCell>
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-muted-foreground line-clamp-1">
                  {item.content}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{item.type}</Badge>
              </TableCell>
              <TableCell>{item.authorName}</TableCell>
              <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    item.status === 'approved'
                      ? 'success'
                      : item.status === 'rejected'
                      ? 'destructive'
                      : 'default'
                  }
                >
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell>
                {item.reportCount ? (
                  <Badge variant="destructive">{item.reportCount}</Badge>
                ) : null}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // TODO: Open content details modal
                  }}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}