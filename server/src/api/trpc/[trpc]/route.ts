import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

async function handler(req: Request) {
  try {
    return await fetchRequestHandler({
      endpoint: "/api/trpc",
      req,
      router: appRouter,
      createContext: async () => createTRPCContext({ req }),
    });
  } catch (error) {
    console.error("tRPC request failed:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Explicitly define handler functions for Next.js App Router
export async function GET(request: Request) {
  return handler(request);
}

export async function POST(request: Request) {
  return handler(request);
}
