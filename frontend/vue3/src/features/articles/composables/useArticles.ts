import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { articlesApi } from '../api/articles.api';
import type { ArticleListParams } from '../api/articles.api';
import { mapArticleDtoToModel } from '../mappers/article.mapper';
import type { Article } from '../types/article.model';

export const ARTICLES_QUERY_KEY = 'articles';

export function useArticles(params: ArticleListParams = {}) {
  const queryKey = computed(() => [ARTICLES_QUERY_KEY, 'list', params]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await articlesApi.list(params);
      return {
        articles: data.data.map(mapArticleDtoToModel),
        meta: {
          total: data.meta.total,
          page: data.meta.page,
          limit: data.meta.limit,
          totalPages: data.meta.total_pages,
        },
      };
    },
    staleTime: 30 * 1000,
  });

  const articles = computed<Article[]>(() => data.value?.articles ?? []);
  const meta = computed(() => data.value?.meta);

  return {
    articles,
    meta,
    isLoading,
    error,
    refetch,
  };
}

export function useArticle(id: string) {
  const queryKey = [ARTICLES_QUERY_KEY, 'detail', id];

  const { data: article, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async (): Promise<Article> => {
      const { data } = await articlesApi.getById(id);
      return mapArticleDtoToModel(data);
    },
    staleTime: 10 * 1000,
  });

  return {
    article,
    isLoading,
    error,
    refetch,
  };
}
