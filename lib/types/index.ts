export * from './api';
export * from './user';

// Common types used across the application
export type DateString = string; // ISO 8601 format
export type UUID = string;

export interface Timestamps {
  createdAt: DateString;
  updatedAt: DateString;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}