import { computed } from 'vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { articlesApi } from '../api/articles.api';
import { mapArticleDtoToModel } from '../mappers/article.mapper';
import { ARTICLES_QUERY_KEY } from './useArticles';
import type { Article } from '../types/article.model';
import { useAuth } from '@/features/auth/composables/useAuth';

export function useArticleLock(article: () => Article | undefined) {
  const queryClient = useQueryClient();
  const { user, can } = useAuth();

  function invalidateArticle() {
    const a = article();
    if (a) {
      queryClient.invalidateQueries({ queryKey: [ARTICLES_QUERY_KEY, 'detail', a.id] });
    }
  }

  const lockMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await articlesApi.lock(id);
      return mapArticleDtoToModel(data);
    },
    onSuccess: () => invalidateArticle(),
  });

  const unlockMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await articlesApi.unlock(id);
      return mapArticleDtoToModel(data);
    },
    onSuccess: () => invalidateArticle(),
  });

  const forceUnlockMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await articlesApi.forceUnlock(id);
      return mapArticleDtoToModel(data);
    },
    onSuccess: () => invalidateArticle(),
  });

  const isLocked = computed(() => {
    const a = article();
    if (!a?.lock) return false;
    return new Date(a.lock.expiresAt) > new Date();
  });

  const isLockedByMe = computed(() => {
    const a = article();
    if (!a?.lock || !user.value) return false;
    return a.lock.lockedBy.id === user.value.id;
  });

  const isLockedByOther = computed(() => {
    return isLocked.value && !isLockedByMe.value;
  });

  const canForceUnlock = computed(() => {
    return can('article.update.any') && isLockedByOther.value;
  });

  const lockExpired = computed(() => {
    const a = article();
    if (!a?.lock) return false;
    return new Date(a.lock.expiresAt) <= new Date();
  });

  return {
    isLocked,
    isLockedByMe,
    isLockedByOther,
    canForceUnlock,
    lockExpired,

    acquireLock: lockMutation.mutateAsync,
    isAcquiringLock: lockMutation.isPending,

    releaseLock: unlockMutation.mutateAsync,
    isReleasingLock: unlockMutation.isPending,

    forceUnlock: forceUnlockMutation.mutateAsync,
    isForcingUnlock: forceUnlockMutation.isPending,
  };
}
