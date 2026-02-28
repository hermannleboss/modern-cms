import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type {
  Article,
  ArticleFilters,
  CreateArticlePayload,
  UpdateArticlePayload,
  PaginatedResponse,
  ArticleHistoryEntry,
} from '~/types';
import { apiFetch } from '~/utils/api';

export const ARTICLES_QUERY_KEY = 'articles';

export function useArticles(filters?: Ref<ArticleFilters>) {
  const queryKey = computed(() => [ARTICLES_QUERY_KEY, 'list', filters?.value ?? {}]);

  return useQuery<PaginatedResponse<Article>>({
    queryKey,
    queryFn: () => {
      const params = filters?.value ?? {};
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, String(value));
        }
      });
      const qs = query.toString();
      return apiFetch<PaginatedResponse<Article>>(`/articles${qs ? `?${qs}` : ''}`);
    },
  });
}

export function useArticle(id: Ref<string> | string) {
  const articleId = computed(() => (typeof id === 'string' ? id : id.value));

  return useQuery<Article>({
    queryKey: [ARTICLES_QUERY_KEY, 'detail', articleId],
    queryFn: () => apiFetch<Article>(`/articles/${articleId.value}`),
    enabled: computed(() => !!articleId.value),
  });
}

export function useArticleHistory(articleId: Ref<string> | string) {
  const id = computed(() => (typeof articleId === 'string' ? articleId : articleId.value));

  return useQuery<ArticleHistoryEntry[]>({
    queryKey: [ARTICLES_QUERY_KEY, 'history', id],
    queryFn: () => apiFetch<ArticleHistoryEntry[]>(`/articles/${id.value}/history`),
    enabled: computed(() => !!id.value),
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateArticlePayload) =>
      apiFetch<Article>('/articles', {
        method: 'POST',
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ARTICLES_QUERY_KEY] });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateArticlePayload }) =>
      apiFetch<Article>(`/articles/${id}`, {
        method: 'PATCH',
        body: payload,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [ARTICLES_QUERY_KEY, 'detail', variables.id] });
      queryClient.invalidateQueries({ queryKey: [ARTICLES_QUERY_KEY, 'list'] });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/articles/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ARTICLES_QUERY_KEY] });
    },
  });
}

export function useUpdateArticleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch<Article>(`/articles/${id}/status`, {
        method: 'PATCH',
        body: { status },
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [ARTICLES_QUERY_KEY, 'detail', variables.id] });
      queryClient.invalidateQueries({ queryKey: [ARTICLES_QUERY_KEY, 'list'] });
    },
  });
}
