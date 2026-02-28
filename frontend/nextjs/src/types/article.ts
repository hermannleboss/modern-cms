export const ArticleStatus = {
  DRAFT: "draft",
  IN_REVIEW: "in_review",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export type ArticleStatusType =
  (typeof ArticleStatus)[keyof typeof ArticleStatus];

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: ArticleStatusType;
  author: ArticleAuthor;
  coAuthors: ArticleAuthor[];
  categories: ArticleCategory[];
  tags: ArticleTag[];
  lock: ArticleLock | null;
  revisionHistory: ArticleRevision[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface ArticleAuthor {
  id: string;
  name: string;
  email: string;
}

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ArticleTag {
  id: string;
  name: string;
  slug: string;
}

export interface ArticleLock {
  lockedBy: ArticleAuthor;
  lockedAt: string;
  expiresAt: string;
}

export interface ArticleRevision {
  id: string;
  content: string;
  editedBy: ArticleAuthor;
  createdAt: string;
}

export interface CreateArticleDTO {
  title: string;
  content: string;
  excerpt: string;
  categoryIds: string[];
  tagIds: string[];
  coAuthorIds: string[];
}

export interface UpdateArticleDTO {
  title?: string;
  content?: string;
  excerpt?: string;
  categoryIds?: string[];
  tagIds?: string[];
  coAuthorIds?: string[];
}

export interface ArticleListParams {
  page?: number;
  limit?: number;
  status?: ArticleStatusType;
  authorId?: string;
  categoryId?: string;
  tagId?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
