import { api } from './api';
import { AuthUser } from '@edupulse/types';

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await api.post('/auth/login', { email, password });
  localStorage.setItem('access_token', res.data.tokens.accessToken);
  localStorage.setItem('refresh_token', res.data.tokens.refreshToken);
  return res.data.user;
}

export async function getMe(): Promise<AuthUser> {
  const res = await api.get('/auth/me');
  return res.data;
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/login';
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}
