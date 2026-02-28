import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type { User, CreateUserPayload, UpdateUserPayload, PaginatedResponse } from '~/types';
import { apiFetch } from '~/utils/api';

export const USERS_QUERY_KEY = 'users';

export function useUsers() {
  return useQuery<PaginatedResponse<User>>({
    queryKey: [USERS_QUERY_KEY],
    queryFn: () => apiFetch<PaginatedResponse<User>>('/users'),
  });
}

export function useUser(id: Ref<string> | string) {
  const userId = computed(() => (typeof id === 'string' ? id : id.value));

  return useQuery<User>({
    queryKey: [USERS_QUERY_KEY, userId],
    queryFn: () => apiFetch<User>(`/users/${userId.value}`),
    enabled: computed(() => !!userId.value),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      apiFetch<User>('/users', { method: 'POST', body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      apiFetch<User>(`/users/${id}`, { method: 'PATCH', body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      apiFetch<User>(`/users/${userId}/role`, { method: 'PATCH', body: { role } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}
