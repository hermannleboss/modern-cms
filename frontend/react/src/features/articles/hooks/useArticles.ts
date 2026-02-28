import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/client';
import type { PaginatedResponse } from '../../../shared/types';
import type { Article, ArticleFormData, ArticleFilters, ArticleHistoryEntry } from '../types';

const ARTICLES_KEY = 'articles';

export function useArticles(filters: ArticleFilters = {}) {
  return useQuery({
    queryKey: [ARTICLES_KEY, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.authorId) params.set('authorId', filters.authorId);
      if (filters.tagId) params.set('tagId', filters.tagId);
      if (filters.categoryId) params.set('categoryId', filters.categoryId);
      if (filters.search) params.set('search', filters.search);
      if (filters.page) params.set('page', String(filters.page));
      if (filters.perPage) params.set('perPage', String(filters.perPage));

      const { data } = await apiClient.get<PaginatedResponse<Article>>('/articles', { params });
      return data;
    },
  });
}

export function useArticle(id: string) {
  return useQuery({
    queryKey: [ARTICLES_KEY, id],
    queryFn: async () => {
      const { data } = await apiClient.get<Article>(`/articles/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: ArticleFormData) => {
      const { data } = await apiClient.post<Article>('/articles', formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ARTICLES_KEY] });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: Partial<ArticleFormData> }) => {
      const { data } = await apiClient.put<Article>(`/articles/${id}`, formData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [ARTICLES_KEY] });
      queryClient.setQueryData([ARTICLES_KEY, data.id], data);
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/articles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ARTICLES_KEY] });
    },
  });
}

export function useArticleHistory(articleId: string) {
  return useQuery({
    queryKey: [ARTICLES_KEY, articleId, 'history'],
    queryFn: async () => {
      const { data } = await apiClient.get<ArticleHistoryEntry[]>(`/articles/${articleId}/history`);
      return data;
    },
    enabled: !!articleId,
  });
}
