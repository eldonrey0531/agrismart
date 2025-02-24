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

const mockChats = [
  {
    id: '1',
    name: 'Juan Dela Cruz',
    lastMessage: 'I have those organic seeds you asked about',
    time: '2m ago',
    unread: 2,
    online: true,
  },
  {
    id: '2',
    name: 'Maria Santos',
    lastMessage: 'The price is ₱1,200 per sack',
    time: '1h ago',
    unread: 0,
    online: false,
  },
  {
    id: '3',
    name: 'Pedro Garcia',
    lastMessage: 'Let me know when you want to check the equipment',
    time: '2h ago',
    unread: 0,
    online: true,
  },
];

const mockMessages = [
  {
    id: '1',
    sender: 'Juan Dela Cruz',
    content: 'I have those organic seeds you asked about',
    time: '2:30 PM',
    isSelf: false,
  },
  {
    id: '2',
    sender: 'You',
    content: 'Great! What varieties do you have available?',
    time: '2:31 PM',
    isSelf: true,
  },
  {
    id: '3',
    sender: 'Juan Dela Cruz',
    content: 'I have RC222 and NSIC Rc160. Both are certified seeds.',
    time: '2:35 PM',
    isSelf: false,
  },
];

export default function MessagesPage() {
  return (
    <div className="flex-1 flex">
      {/* Chat List */}
      <div className="w-80 border-r">
        <div className="p-4 border-b">
          <div className="relative">
            <Icons.search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-2 p-2">
          {mockChats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "flex items-center gap-3 rounded-lg p-3 cursor-pointer hover:bg-accent",
                chat.unread > 0 && "bg-accent"
              )}
            >
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Icons.user className="h-5 w-5 text-primary" />
                </div>
                {chat.online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{chat.name}</p>
                  <span className="text-xs text-muted-foreground">
                    {chat.time}
                  </span>
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {chat.lastMessage}
                </p>
              </div>
              {chat.unread > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {chat.unread}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Icons.user className="h-5 w-5 text-primary" />
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
            </div>
            <div>
              <p className="font-medium">Juan Dela Cruz</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
          <div className="flex gap-2">
            <ButtonWrapper variant="ghost" size="icon">
              <Icons.search className="h-4 w-4" />
            </ButtonWrapper>
            <ButtonWrapper variant="ghost" size="icon">
              <Icons.bell className="h-4 w-4" />
            </ButtonWrapper>
            <ButtonWrapper variant="ghost" size="icon">
              <Icons.settings className="h-4 w-4" />
            </ButtonWrapper>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-auto">
          {mockMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.isSelf && "flex-row-reverse"
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Icons.user className="h-4 w-4 text-primary" />
              </div>
              <div className={cn(
                "rounded-lg p-3 max-w-[70%]",
                message.isSelf
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}>
                <p className="text-sm">{message.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <ButtonWrapper variant="outline" size="icon">
              <Icons.add className="h-4 w-4" />
            </ButtonWrapper>
            <Input
              placeholder="Type a message..."
              className="flex-1"
            />
            <ButtonWrapper>
              <Icons.messageSquare className="mr-2 h-4 w-4" />
              Send
            </ButtonWrapper>
          </div>
        </div>
      </div>
    </div>
  );
}