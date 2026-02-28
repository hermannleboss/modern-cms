import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type { Tag, CreateTagPayload, UpdateTagPayload } from '~/types';
import { apiFetch } from '~/utils/api';

export const TAGS_QUERY_KEY = 'tags';

export function useTags() {
  return useQuery<Tag[]>({
    queryKey: [TAGS_QUERY_KEY],
    queryFn: () => apiFetch<Tag[]>('/tags'),
  });
}

export function useTag(id: Ref<string> | string) {
  const tagId = computed(() => (typeof id === 'string' ? id : id.value));

  return useQuery<Tag>({
    queryKey: [TAGS_QUERY_KEY, tagId],
    queryFn: () => apiFetch<Tag>(`/tags/${tagId.value}`),
    enabled: computed(() => !!tagId.value),
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTagPayload) =>
      apiFetch<Tag>('/tags', { method: 'POST', body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTagPayload }) =>
      apiFetch<Tag>(`/tags/${id}`, { method: 'PATCH', body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/tags/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
    },
  });
}
