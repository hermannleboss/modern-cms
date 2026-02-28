import { apiClient } from '@/shared/api/axios-instance';
import type { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '../types/category.dto';

export const categoriesApi = {
  list() {
    return apiClient.get<CategoryDto[]>('/categories');
  },

  getById(id: string) {
    return apiClient.get<CategoryDto>(`/categories/${id}`);
  },

  create(data: CreateCategoryDto) {
    return apiClient.post<CategoryDto>('/categories', data);
  },

  update(id: string, data: UpdateCategoryDto) {
    return apiClient.patch<CategoryDto>(`/categories/${id}`, data);
  },

  delete(id: string) {
    return apiClient.delete(`/categories/${id}`);
  },
};
