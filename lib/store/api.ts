import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { RootState } from './index';

// Base API configuration for RTK Query
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      
      headers.set('Content-Type', 'application/json');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  endpoints: () => ({}),
  tagTypes: ['User', 'Chat', 'Message'], // Add your entity tags here
});

// Example endpoint builder
export const exampleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getData: builder.query({
      query: () => 'endpoint-path',
    }),
  }),
  overrideExisting: false,
});

export const { useGetDataQuery } = exampleApi;
