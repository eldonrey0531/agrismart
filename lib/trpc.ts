import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import { type AppRouter } from '@/server/api/root';
import { queryClient } from './query-client';
import superjson from 'superjson';

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // browser should use relative path
    return '';
  }

  if (process.env.VERCEL_URL) {
    // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  }

  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const getTRPCClient = () => {
  return trpc.createClient({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        headers() {
          return {
            'Content-Type': 'application/json',
          };
        },
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: 'include', // Important for auth
          });
        },
      }),
    ],
  });
};

export const trpcClient = getTRPCClient();
