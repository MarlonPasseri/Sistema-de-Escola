import { UserRole } from './enums';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  schoolId: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  schoolId: string;
  avatarUrl?: string;
}
