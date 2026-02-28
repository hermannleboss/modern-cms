import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/client';
import type { PaginatedResponse } from '../../../shared/types';
import type { Tag, TagFormData } from '../types';

const TAGS_KEY = 'tags';

export function useTags() {
  return useQuery({
    queryKey: [TAGS_KEY],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Tag>>('/tags');
      return data;
    },
  });
}

export function useTag(id: string) {
  return useQuery({
    queryKey: [TAGS_KEY, id],
    queryFn: async () => {
      const { data } = await apiClient.get<Tag>(`/tags/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: TagFormData) => {
      const { data } = await apiClient.post<Tag>('/tags', formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_KEY] });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: TagFormData }) => {
      const { data } = await apiClient.put<Tag>(`/tags/${id}`, formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_KEY] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/tags/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_KEY] });
    },
  });
}
