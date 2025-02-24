import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { IUser } from '@/types/auth';
import { getAuthToken } from '@/lib/utils/cookies';

// Using Next.js API routes instead of direct Express server
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/api`,
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Using Next.js Auth API routes
    signup: builder.mutation<{ user: IUser }, { name: string; email: string; password: string }>({
      query: (data) => ({
        url: '/auth/signup',
        method: 'POST',
        body: data,
      }),
    }),
    // Get current user profile
    getProfile: builder.query<IUser, void>({
      query: () => '/auth/session',
    }),
  }),
});

export const {
  useSignupMutation,
  useGetProfileQuery,
} = authApi;
