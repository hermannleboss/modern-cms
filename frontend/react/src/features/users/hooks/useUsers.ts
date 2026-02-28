import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/client';
import type { PaginatedResponse, Role } from '../../../shared/types';
import type { UserDetails, InviteUserData, AssignRoleData } from '../types';

const USERS_KEY = 'users';
const ROLES_KEY = 'roles';

export function useUsers() {
  return useQuery({
    queryKey: [USERS_KEY],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<UserDetails>>('/users');
      return data;
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: [USERS_KEY, id],
    queryFn: async () => {
      const { data } = await apiClient.get<UserDetails>(`/users/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: [ROLES_KEY],
    queryFn: async () => {
      const { data } = await apiClient.get<Role[]>('/roles');
      return data;
    },
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteData: InviteUserData) => {
      const { data } = await apiClient.post<UserDetails>('/users/invite', inviteData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    },
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignData: AssignRoleData) => {
      const { data } = await apiClient.put<UserDetails>(
        `/users/${assignData.userId}/roles`,
        { roleIds: assignData.roleIds },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    },
  });
}
