import { apiClient } from '@/shared/api/axios-instance';
import type { UserSummaryDto, InviteUserDto, AssignRoleDto } from '../types/user.dto';

export const usersApi = {
  list() {
    return apiClient.get<UserSummaryDto[]>('/users');
  },

  getById(id: string) {
    return apiClient.get<UserSummaryDto>(`/users/${id}`);
  },

  invite(data: InviteUserDto) {
    return apiClient.post<UserSummaryDto>('/users/invite', data);
  },

  assignRole(userId: string, data: AssignRoleDto) {
    return apiClient.patch<UserSummaryDto>(`/users/${userId}/role`, data);
  },
};
