import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Chat, ChatSkeleton } from "@/components/chat/Chat";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Chat | AgriHub",
  description: "Real-time messaging with other users on AgriHub",
};

export default async function ChatPage() {
  const session = await auth();

  if (!session) {
    redirect("/login?callbackUrl=/chat");
  }

  return (
    <Suspense fallback={<ChatSkeleton />}>
      <div className="container mx-auto h-[calc(100vh-4rem)]">
        <Chat />
      </div>
    </Suspense>
  );
}

// Generate static params at build time
export function generateStaticParams() {
  return [{ path: [] }];
}

// Configure dynamic params
export const dynamicParams = true;

// Configure caching behavior
export const revalidate = 0; // Disable caching for real-time updates

// Configure runtime
export const runtime = "edge"; // Use edge runtime for better performance