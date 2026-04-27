'use client';

import { useQuery } from '@tanstack/react-query';
import { getMe, getToken } from '@/lib/auth';

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    enabled: !!getToken(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return { user, isLoading, isAuthenticated: !!user };
}
