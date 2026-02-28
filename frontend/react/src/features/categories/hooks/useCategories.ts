import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/client';
import type { PaginatedResponse } from '../../../shared/types';
import type { Category, CategoryFormData } from '../types';

const CATEGORIES_KEY = 'categories';

export function useCategories() {
  return useQuery({
    queryKey: [CATEGORIES_KEY],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Category>>('/categories');
      return data;
    },
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: [CATEGORIES_KEY, id],
    queryFn: async () => {
      const { data } = await apiClient.get<Category>(`/categories/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: CategoryFormData) => {
      const { data } = await apiClient.post<Category>('/categories', formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: CategoryFormData }) => {
      const { data } = await apiClient.put<Category>(`/categories/${id}`, formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    },
  });
}
