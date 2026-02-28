import { useQueryClient, useMutation } from '@tanstack/vue-query';
import { articlesApi } from '../api/articles.api';
import { mapArticleDtoToModel, mapCreatePayloadToDto, mapUpdatePayloadToDto } from '../mappers/article.mapper';
import { ARTICLES_QUERY_KEY } from './useArticles';
import type { CreateArticlePayload, UpdateArticlePayload } from '../types/article.model';

export function useArticleMutations() {
  const queryClient = useQueryClient();

  function invalidateArticles() {
    queryClient.invalidateQueries({ queryKey: [ARTICLES_QUERY_KEY] });
  }

  const createMutation = useMutation({
    mutationFn: async (payload: CreateArticlePayload) => {
      const dto = mapCreatePayloadToDto(payload);
      const { data } = await articlesApi.create(dto);
      return mapArticleDtoToModel(data);
    },
    onSuccess: () => invalidateArticles(),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateArticlePayload }) => {
      const dto = mapUpdatePayloadToDto(payload);
      const { data } = await articlesApi.update(id, dto);
      return mapArticleDtoToModel(data);
    },
    onSuccess: () => invalidateArticles(),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await articlesApi.delete(id);
    },
    onSuccess: () => invalidateArticles(),
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await articlesApi.publish(id);
      return mapArticleDtoToModel(data);
    },
    onSuccess: () => invalidateArticles(),
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await articlesApi.archive(id);
      return mapArticleDtoToModel(data);
    },
    onSuccess: () => invalidateArticles(),
  });

  const submitForReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await articlesApi.submitForReview(id);
      return mapArticleDtoToModel(data);
    },
    onSuccess: () => invalidateArticles(),
  });

  return {
    createArticle: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    updateArticle: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,

    deleteArticle: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,

    publishArticle: publishMutation.mutateAsync,
    isPublishing: publishMutation.isPending,

    archiveArticle: archiveMutation.mutateAsync,
    isArchiving: archiveMutation.isPending,

    submitForReview: submitForReviewMutation.mutateAsync,
    isSubmittingForReview: submitForReviewMutation.isPending,
  };
}
