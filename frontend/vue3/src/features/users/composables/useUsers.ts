import { computed } from 'vue';
import { useQuery, useQueryClient, useMutation } from '@tanstack/vue-query';
import { usersApi } from '../api/users.api';
import { mapUserSummaryDtoToModel, mapInvitePayloadToDto } from '../mappers/user.mapper';
import type { UserSummary, InviteUserPayload, AssignRolePayload } from '../types/user.model';

const USERS_QUERY_KEY = ['users'];

export function useUsers() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: async (): Promise<UserSummary[]> => {
      const { data } = await usersApi.list();
      return data.map(mapUserSummaryDtoToModel);
    },
    staleTime: 30 * 1000,
  });

  const users = computed<UserSummary[]>(() => data.value ?? []);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
  }

  const inviteMutation = useMutation({
    mutationFn: async (payload: InviteUserPayload) => {
      const dto = mapInvitePayloadToDto(payload);
      const { data } = await usersApi.invite(dto);
      return mapUserSummaryDtoToModel(data);
    },
    onSuccess: () => invalidate(),
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, payload }: { userId: string; payload: AssignRolePayload }) => {
      const { data } = await usersApi.assignRole(userId, { role_id: payload.roleId });
      return mapUserSummaryDtoToModel(data);
    },
    onSuccess: () => invalidate(),
  });

  return {
    users,
    isLoading,
    error,

    inviteUser: inviteMutation.mutateAsync,
    isInviting: inviteMutation.isPending,

    assignRole: assignRoleMutation.mutateAsync,
    isAssigningRole: assignRoleMutation.isPending,
  };
}
