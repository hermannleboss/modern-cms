import { useQueryClient, useQuery, useMutation } from '@tanstack/vue-query';
import type { AuthResponse, LoginCredentials, User } from '~/types';
import { apiFetch, setStoredTokens, clearStoredTokens, getStoredTokens } from '~/utils/api';

export const AUTH_QUERY_KEY = ['auth', 'me'] as const;

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError } = useQuery<User | null>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      const tokens = getStoredTokens();
      if (!tokens?.accessToken) return null;
      try {
        return await apiFetch<User>('/auth/me');
      } catch {
        clearStoredTokens();
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: credentials,
      });
      setStoredTokens(response.tokens);
      return response.user;
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, userData);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await apiFetch('/auth/logout', { method: 'POST' });
      } finally {
        clearStoredTokens();
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.clear();
      navigateTo('/login');
    },
  });

  const isAuthenticated = computed(() => !!user.value);

  return {
    user,
    isLoading,
    isError,
    isAuthenticated,
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}
