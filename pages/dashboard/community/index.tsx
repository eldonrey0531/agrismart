'use client';

import { Icons } from '@/components/ui/icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ButtonWrapper } from '@/components/ui/button-wrapper';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockPosts = [
  {
    id: '1',
    author: 'Juan Dela Cruz',
    title: 'Best practices for organic rice farming',
    content: 'Sharing my experience with organic farming methods that increased yield by 25%...',
    likes: 45,
    comments: 12,
    tags: ['Organic Farming', 'Rice', 'Best Practices'],
    timeAgo: '2 hours ago',
  },
  {
    id: '2',
    author: 'Maria Santos',
    title: 'Weather advisory for Central Luzon farmers',
    content: 'Important weather updates and recommendations for the upcoming planting season...',
    likes: 32,
    comments: 8,
    tags: ['Weather', 'Advisory', 'Planning'],
    timeAgo: '5 hours ago',
  },
  {
    id: '3',
    author: 'Pedro Garcia',
    title: 'New pest control techniques',
    content: 'Discovered an effective natural pest control method using local ingredients...',
    likes: 28,
    comments: 15,
    tags: ['Pest Control', 'Organic', 'Tips'],
    timeAgo: '1 day ago',
  },
];

const topics = [
  'All Topics',
  'Organic Farming',
  'Weather Updates',
  'Market Prices',
  'Pest Control',
  'Equipment',
];

export default function CommunityPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Community</h2>
        <ButtonWrapper variant="default">
          <Icons.add className="mr-2 h-4 w-4" />
          Create Post
        </ButtonWrapper>
      </div>

      {/* Search and Topics */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Icons.search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search discussions..."
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <ButtonWrapper
                  key={topic}
                  variant="outline"
                  size="sm"
                >
                  {topic}
                </ButtonWrapper>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        {mockPosts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>
                    Posted by {post.author} · {post.timeAgo}
                  </CardDescription>
                </div>
                <ButtonWrapper variant="ghost" size="sm">
                  <Icons.bell className="h-4 w-4" />
                </ButtonWrapper>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {post.content}
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <ButtonWrapper variant="ghost" size="sm">
                    <Icons.star className="mr-1 h-4 w-4" />
                    {post.likes} Likes
                  </ButtonWrapper>
                  <ButtonWrapper variant="ghost" size="sm">
                    <Icons.messageSquare className="mr-1 h-4 w-4" />
                    {post.comments} Comments
                  </ButtonWrapper>
                  <ButtonWrapper variant="ghost" size="sm">
                    <Icons.edit className="mr-1 h-4 w-4" />
                    Share
                  </ButtonWrapper>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sidebar Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Popular Topics</CardTitle>
            <CardDescription>
              Trending discussions in the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topics.slice(1).map((topic) => (
                <div
                  key={topic}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <span>{topic}</span>
                  <ButtonWrapper variant="ghost" size="sm">
                    Follow
                  </ButtonWrapper>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Community Guidelines</CardTitle>
            <CardDescription>
              Help us maintain a helpful and friendly community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>• Be respectful and constructive</p>
              <p>• Share accurate and verified information</p>
              <p>• Keep discussions agriculture-related</p>
              <p>• Report inappropriate content</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}