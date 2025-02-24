import { IMessage } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";

interface ChatMessageProps {
  message: IMessage;
  isOwn: boolean;
}

export function ChatMessage({ message, isOwn }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex gap-2",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg p-3 relative group",
          isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        <p>{message.content}</p>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs opacity-70">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          {isOwn && (
            <span className="opacity-70">
              {message.status === 'read' ? (
                <CheckCheck className="h-3 w-3" />
              ) : message.status === 'delivered' ? (
                <Check className="h-3 w-3" />
              ) : null}
            </span>
          )}
        </div>

        {/* Hover timestamp */}
        <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-muted-foreground">
          {new Date(message.timestamp).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

interface ChatMessageSkeletonProps {
  isOwn?: boolean;
}

export function ChatMessageSkeleton({ isOwn = false }: ChatMessageSkeletonProps) {
  return (
    <div
      className={cn(
        "flex gap-2",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "h-[60px] w-[200px] rounded-lg animate-pulse",
          isOwn ? "bg-primary/20" : "bg-muted/50"
        )}
      />
    </div>
  );
}