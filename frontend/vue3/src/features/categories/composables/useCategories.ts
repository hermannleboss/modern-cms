import { computed } from 'vue';
import { useQuery, useQueryClient, useMutation } from '@tanstack/vue-query';
import { categoriesApi } from '../api/categories.api';
import { mapCategoryDtoToModel, mapCreateCategoryPayloadToDto, mapUpdateCategoryPayloadToDto } from '../mappers/category.mapper';
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from '../types/category.model';

const CATEGORIES_QUERY_KEY = ['categories'];

export function useCategories() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async (): Promise<Category[]> => {
      const { data } = await categoriesApi.list();
      return data.map(mapCategoryDtoToModel);
    },
    staleTime: 60 * 1000,
  });

  const categories = computed<Category[]>(() => data.value ?? []);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
  }

  const createMutation = useMutation({
    mutationFn: async (payload: CreateCategoryPayload) => {
      const dto = mapCreateCategoryPayloadToDto(payload);
      const { data } = await categoriesApi.create(dto);
      return mapCategoryDtoToModel(data);
    },
    onSuccess: () => invalidate(),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) => {
      const dto = mapUpdateCategoryPayloadToDto(payload);
      const { data } = await categoriesApi.update(id, dto);
      return mapCategoryDtoToModel(data);
    },
    onSuccess: () => invalidate(),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await categoriesApi.delete(id);
    },
    onSuccess: () => invalidate(),
  });

  return {
    categories,
    isLoading,
    error,

    createCategory: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateCategory: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteCategory: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
