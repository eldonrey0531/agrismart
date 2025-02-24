// Define all role-related types in one place
export const Role = {
  USER: 'user',
  SELLER: 'seller',
  ADMIN: 'admin',
} as const;

export const Status = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

export type Role = typeof Role[keyof typeof Role];
export type Status = typeof Status[keyof typeof Status];

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  status: Status;
  avatar?: string;
  iat?: number;
  exp?: number;
}

// JWT specific payload type
export type JWTPayload = Pick<AuthUser, 'id' | 'email' | 'role'> & {
  iat?: number;
  exp?: number;
};