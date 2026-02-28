import { apiClient } from '@/shared/api/axios-instance';
import type { ArticleDto, ArticleListDto, CreateArticleDto, UpdateArticleDto } from '../types/article.dto';

export interface ArticleListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export const articlesApi = {
  list(params: ArticleListParams = {}) {
    return apiClient.get<ArticleListDto>('/articles', { params });
  },

  getById(id: string) {
    return apiClient.get<ArticleDto>(`/articles/${id}`);
  },

  create(data: CreateArticleDto) {
    return apiClient.post<ArticleDto>('/articles', data);
  },

  update(id: string, data: UpdateArticleDto) {
    return apiClient.patch<ArticleDto>(`/articles/${id}`, data);
  },

  delete(id: string) {
    return apiClient.delete(`/articles/${id}`);
  },

  lock(id: string) {
    return apiClient.post<ArticleDto>(`/articles/${id}/lock`);
  },

  unlock(id: string) {
    return apiClient.post<ArticleDto>(`/articles/${id}/unlock`);
  },

  forceUnlock(id: string) {
    return apiClient.post<ArticleDto>(`/articles/${id}/force-unlock`);
  },

  publish(id: string) {
    return apiClient.post<ArticleDto>(`/articles/${id}/publish`);
  },

  archive(id: string) {
    return apiClient.post<ArticleDto>(`/articles/${id}/archive`);
  },

  submitForReview(id: string) {
    return apiClient.post<ArticleDto>(`/articles/${id}/submit-review`);
  },
};
