import { computed, ref } from 'vue';
import { useQuery, useQueryClient, useMutation } from '@tanstack/vue-query';
import { authApi } from '../api/auth.api';
import { mapUserDtoToModel } from '../mappers/auth.mapper';
import type { User, LoginCredentials } from '../types/auth.model';

const AUTH_QUERY_KEY = ['auth', 'me'] as const;

const isAuthenticated = ref(!!localStorage.getItem('access_token'));

export function useAuth() {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async (): Promise<User> => {
      const { data } = await authApi.getMe();
      return mapUserDtoToModel(data);
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await authApi.login(credentials);
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
      isAuthenticated.value = true;
      const mappedUser = mapUserDtoToModel(data.user);
      queryClient.setQueryData(AUTH_QUERY_KEY, mappedUser);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authApi.logout();
    },
    onSettled: () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      isAuthenticated.value = false;
      queryClient.clear();
    },
  });

  const effectivePermissions = computed<string[]>(() => {
    if (!user.value) return [];
    const rolePerms = user.value.role?.permissions ?? [];
    const userPerms = user.value.permissions ?? [];
    return [...new Set([...rolePerms, ...userPerms])];
  });

  function can(permission: string): boolean {
    return effectivePermissions.value.includes(permission);
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    effectivePermissions,
    can,
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}
