import { apiClient } from '@/shared/api/axios-instance';
import type { LoginRequestDto, LoginResponseDto, UserDto } from '../types/auth.dto';

export const authApi = {
  login(credentials: LoginRequestDto) {
    return apiClient.post<LoginResponseDto>('/auth/login', credentials);
  },

  logout() {
    return apiClient.post('/auth/logout');
  },

  getMe() {
    return apiClient.get<UserDto>('/auth/me');
  },

  refreshToken(refreshToken: string) {
    return apiClient.post<LoginResponseDto>('/auth/refresh', { refreshToken });
  },
};
