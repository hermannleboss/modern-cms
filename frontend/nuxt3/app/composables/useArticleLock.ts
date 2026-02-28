import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type { ArticleLock } from '~/types';
import { apiFetch } from '~/utils/api';
import { ARTICLES_QUERY_KEY } from '~/composables/useArticles';

export function useArticleLock(articleId: Ref<string> | string) {
  const queryClient = useQueryClient();
  const id = computed(() => (typeof articleId === 'string' ? articleId : articleId.value));

  const { data: lock, isLoading: isLockLoading } = useQuery<ArticleLock | null>({
    queryKey: [ARTICLES_QUERY_KEY, 'lock', id],
    queryFn: () => apiFetch<ArticleLock | null>(`/articles/${id.value}/lock`),
    enabled: computed(() => !!id.value),
    refetchInterval: 30_000,
  });

  const acquireLock = useMutation({
    mutationFn: () =>
      apiFetch<ArticleLock>(`/articles/${id.value}/lock`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ARTICLES_QUERY_KEY, 'lock', id.value] });
      queryClient.invalidateQueries({ queryKey: [ARTICLES_QUERY_KEY, 'detail', id.value] });
    },
  });

  const releaseLock = useMutation({
    mutationFn: () =>
      apiFetch<void>(`/articles/${id.value}/lock`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ARTICLES_QUERY_KEY, 'lock', id.value] });
      queryClient.invalidateQueries({ queryKey: [ARTICLES_QUERY_KEY, 'detail', id.value] });
    },
  });

  const forceUnlock = useMutation({
    mutationFn: () =>
      apiFetch<void>(`/articles/${id.value}/lock/force`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ARTICLES_QUERY_KEY, 'lock', id.value] });
      queryClient.invalidateQueries({ queryKey: [ARTICLES_QUERY_KEY, 'detail', id.value] });
    },
  });

  const isLocked = computed(() => !!lock.value);

  return {
    lock,
    isLocked,
    isLockLoading,
    acquireLock: acquireLock.mutateAsync,
    isAcquiring: acquireLock.isPending,
    releaseLock: releaseLock.mutateAsync,
    isReleasing: releaseLock.isPending,
    forceUnlock: forceUnlock.mutateAsync,
    isForceUnlocking: forceUnlock.isPending,
  };
}
