import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from '~/types';
import { apiFetch } from '~/utils/api';

export const CATEGORIES_QUERY_KEY = 'categories';

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: [CATEGORIES_QUERY_KEY],
    queryFn: () => apiFetch<Category[]>('/categories'),
  });
}

export function useCategory(id: Ref<string> | string) {
  const categoryId = computed(() => (typeof id === 'string' ? id : id.value));

  return useQuery<Category>({
    queryKey: [CATEGORIES_QUERY_KEY, categoryId],
    queryFn: () => apiFetch<Category>(`/categories/${categoryId.value}`),
    enabled: computed(() => !!categoryId.value),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) =>
      apiFetch<Category>('/categories', { method: 'POST', body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      apiFetch<Category>(`/categories/${id}`, { method: 'PATCH', body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
    },
  });
}
