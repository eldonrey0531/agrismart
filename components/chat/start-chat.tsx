"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useChat } from "@/hooks/use-chat";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquarePlus } from "lucide-react";

export function StartChat() {
  const { startConversation } = useChat();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const userId = formData.get("userId") as string;
    const message = formData.get("message") as string;

    if (!userId || !message) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      setLoading(false);
      return;
    }

    try {
      const conversation = await startConversation(userId, message);
      
      if (conversation) {
        toast({
          title: "Success",
          description: "Started new conversation",
        });
        setIsOpen(false);
      } else {
        throw new Error("Failed to start conversation");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start conversation",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <MessageSquarePlus className="w-4 h-4 mr-2" />
          Start New Chat
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a New Conversation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              name="userId"
              placeholder="Enter user ID"
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              name="message"
              placeholder="Type your first message..."
              disabled={loading}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Starting Chat..." : "Start Chat"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}