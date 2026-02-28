export type ArticleStatus = 'draft' | 'in_review' | 'published' | 'archived';

export interface ArticleAuthor {
  id: string;
  name: string;
  email: string;
}

export interface ArticleLock {
  lockedBy: ArticleAuthor;
  lockedAt: string;
  expiresAt: string;
}

export interface ArticleHistoryEntry {
  id: string;
  editedBy: ArticleAuthor;
  editedAt: string;
  summary: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: ArticleStatus;
  author: ArticleAuthor;
  coAuthors: ArticleAuthor[];
  categoryId: string | null;
  tags: string[];
  lock: ArticleLock | null;
  history: ArticleHistoryEntry[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface CreateArticlePayload {
  title: string;
  content: string;
  excerpt: string;
  categoryId?: string | null;
  tags?: string[];
  coAuthorIds?: string[];
}

export interface UpdateArticlePayload extends Partial<CreateArticlePayload> {
  status?: ArticleStatus;
}
