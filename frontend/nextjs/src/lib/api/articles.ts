import { authenticatedClient } from "./client";
import type {
  Article,
  CreateArticleDTO,
  UpdateArticleDTO,
  ArticleListParams,
  PaginatedResponse,
} from "@/types";

export function createArticlesApi(accessToken: string) {
  const client = authenticatedClient(accessToken);

  return {
    list(params?: ArticleListParams): Promise<PaginatedResponse<Article>> {
      return client<PaginatedResponse<Article>>("/articles", {
        params: params as Record<string, string | number | undefined>,
      });
    },

    getById(id: string): Promise<Article> {
      return client<Article>(`/articles/${encodeURIComponent(id)}`);
    },

    create(data: CreateArticleDTO): Promise<Article> {
      return client<Article>("/articles", {
        method: "POST",
        body: data,
      });
    },

    update(id: string, data: UpdateArticleDTO): Promise<Article> {
      return client<Article>(`/articles/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: data,
      });
    },

    delete(id: string): Promise<void> {
      return client<void>(`/articles/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },

    publish(id: string): Promise<Article> {
      return client<Article>(`/articles/${encodeURIComponent(id)}/publish`, {
        method: "POST",
      });
    },

    submitForReview(id: string): Promise<Article> {
      return client<Article>(`/articles/${encodeURIComponent(id)}/submit`, {
        method: "POST",
      });
    },

    archive(id: string): Promise<Article> {
      return client<Article>(`/articles/${encodeURIComponent(id)}/archive`, {
        method: "POST",
      });
    },

    lock(id: string): Promise<Article> {
      return client<Article>(`/articles/${encodeURIComponent(id)}/lock`, {
        method: "POST",
      });
    },

    unlock(id: string): Promise<Article> {
      return client<Article>(`/articles/${encodeURIComponent(id)}/unlock`, {
        method: "POST",
      });
    },

    getRevisions(id: string): Promise<Article["revisionHistory"]> {
      return client<Article["revisionHistory"]>(
        `/articles/${encodeURIComponent(id)}/revisions`,
      );
    },
  };
}
