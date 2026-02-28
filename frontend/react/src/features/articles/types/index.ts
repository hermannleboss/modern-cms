import type { User } from '../../../shared/types';

export type ArticleStatus = 'draft' | 'in_review' | 'published' | 'archived';

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: ArticleStatus;
  author: Pick<User, 'id' | 'name' | 'email'>;
  coAuthors: Pick<User, 'id' | 'name' | 'email'>[];
  tags: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  lock: ArticleLock | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface ArticleLock {
  lockedBy: Pick<User, 'id' | 'name' | 'email'>;
  lockedAt: string;
  expiresAt: string;
}

export interface ArticleFormData {
  title: string;
  content: string;
  excerpt: string;
  status: ArticleStatus;
  tagIds: string[];
  categoryIds: string[];
  coAuthorIds: string[];
}

export interface ArticleFilters {
  status?: ArticleStatus;
  authorId?: string;
  tagId?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  perPage?: number;
}

export interface ArticleHistoryEntry {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  action: string;
  changes: Record<string, unknown>;
  createdAt: string;
}
