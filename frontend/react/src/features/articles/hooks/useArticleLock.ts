import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/client';
import type { ArticleLock } from '../types';

const ARTICLES_KEY = 'articles';

export function useAcquireLock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (articleId: string) => {
      const { data } = await apiClient.post<ArticleLock>(`/articles/${articleId}/lock`);
      return data;
    },
    onSuccess: (_data, articleId) => {
      queryClient.invalidateQueries({ queryKey: [ARTICLES_KEY, articleId] });
    },
  });
}

export function useReleaseLock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (articleId: string) => {
      await apiClient.delete(`/articles/${articleId}/lock`);
    },
    onSuccess: (_data, articleId) => {
      queryClient.invalidateQueries({ queryKey: [ARTICLES_KEY, articleId] });
    },
  });
}

export function useForceUnlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (articleId: string) => {
      await apiClient.post(`/articles/${articleId}/force-unlock`);
    },
    onSuccess: (_data, articleId) => {
      queryClient.invalidateQueries({ queryKey: [ARTICLES_KEY, articleId] });
    },
  });
}
