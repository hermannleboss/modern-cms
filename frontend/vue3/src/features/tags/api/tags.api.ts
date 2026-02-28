import { apiClient } from '@/shared/api/axios-instance';
import type { TagDto, CreateTagDto, UpdateTagDto } from '../types/tag.dto';

export const tagsApi = {
  list() {
    return apiClient.get<TagDto[]>('/tags');
  },

  getById(id: string) {
    return apiClient.get<TagDto>(`/tags/${id}`);
  },

  create(data: CreateTagDto) {
    return apiClient.post<TagDto>('/tags', data);
  },

  update(id: string, data: UpdateTagDto) {
    return apiClient.patch<TagDto>(`/tags/${id}`, data);
  },

  delete(id: string) {
    return apiClient.delete(`/tags/${id}`);
  },
};
