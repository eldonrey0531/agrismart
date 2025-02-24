import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  User, 
  Flag, 
  UserMinus, 
  Volume2, 
  VolumeX,
  Archive 
} from "lucide-react";
import type { IConversation } from "@/types/chat";

interface ChatHeaderProps {
  conversation: IConversation;
  onMute?: () => void;
  onBlock?: () => void;
  onReport?: () => void;
  isMuted?: boolean;
}

export function ChatHeader({
  conversation,
  onMute,
  onBlock,
  onReport,
  isMuted = false,
}: ChatHeaderProps) {
  const participant = conversation.participants[0];

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          {participant.image ? (
            <img
              src={participant.image}
              alt={participant.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-5 h-5" />
          )}
        </div>
        <div>
          <h2 className="font-semibold">{participant.name}</h2>
          <p className="text-sm text-muted-foreground">
            {conversation.lastMessage?.timestamp
              ? `Last active ${new Date(conversation.lastMessage.timestamp).toLocaleDateString()}`
              : "No recent activity"}
          </p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onMute}>
            {isMuted ? (
              <>
                <Volume2 className="w-4 h-4 mr-2" />
                <span>Unmute</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 mr-2" />
                <span>Mute</span>
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onBlock}>
            <UserMinus className="w-4 h-4 mr-2" />
            <span>Block User</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onReport}>
            <Flag className="w-4 h-4 mr-2" />
            <span>Report</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Archive className="w-4 h-4 mr-2" />
            <span>Archive Chat</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}