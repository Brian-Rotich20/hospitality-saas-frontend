// Auth types for defining the structure of authentication-related data, such as user credentials, authentication tokens, and user information.
export type UserRole = 'customer' | 'vendor' | 'admin';

export interface User {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
}