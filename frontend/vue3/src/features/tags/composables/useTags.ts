import { computed } from 'vue';
import { useQuery, useQueryClient, useMutation } from '@tanstack/vue-query';
import { tagsApi } from '../api/tags.api';
import { mapTagDtoToModel } from '../mappers/tag.mapper';
import type { Tag, CreateTagPayload, UpdateTagPayload } from '../types/tag.model';

const TAGS_QUERY_KEY = ['tags'];

export function useTags() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: TAGS_QUERY_KEY,
    queryFn: async (): Promise<Tag[]> => {
      const { data } = await tagsApi.list();
      return data.map(mapTagDtoToModel);
    },
    staleTime: 60 * 1000,
  });

  const tags = computed<Tag[]>(() => data.value ?? []);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
  }

  const createMutation = useMutation({
    mutationFn: async (payload: CreateTagPayload) => {
      const { data } = await tagsApi.create(payload);
      return mapTagDtoToModel(data);
    },
    onSuccess: () => invalidate(),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateTagPayload }) => {
      const { data } = await tagsApi.update(id, payload);
      return mapTagDtoToModel(data);
    },
    onSuccess: () => invalidate(),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await tagsApi.delete(id);
    },
    onSuccess: () => invalidate(),
  });

  return {
    tags,
    isLoading,
    error,

    createTag: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateTag: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteTag: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
