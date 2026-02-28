// ===== Auth =====
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ===== User =====
export type UserRole = 'admin' | 'editor' | 'author' | 'contributor' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: UserRole;
}

// ===== Permissions =====
export type Permission =
  | 'article.create'
  | 'article.read'
  | 'article.update.own'
  | 'article.update.any'
  | 'article.delete.own'
  | 'article.delete.any'
  | 'article.publish'
  | 'article.archive'
  | 'user.read'
  | 'user.create'
  | 'user.update'
  | 'user.delete'
  | 'user.invite'
  | 'user.assign_role'
  | 'category.create'
  | 'category.read'
  | 'category.update'
  | 'category.delete'
  | 'tag.create'
  | 'tag.read'
  | 'tag.update'
  | 'tag.delete'
  | 'lock.force_unlock';

// ===== Article =====
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
  tags: Tag[];
  categories: Category[];
  lock: ArticleLock | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface CreateArticlePayload {
  title: string;
  content: string;
  excerpt?: string;
  status?: ArticleStatus;
  tagIds?: string[];
  categoryIds?: string[];
  coAuthorIds?: string[];
}

export interface UpdateArticlePayload {
  title?: string;
  content?: string;
  excerpt?: string;
  status?: ArticleStatus;
  tagIds?: string[];
  categoryIds?: string[];
  coAuthorIds?: string[];
}

export interface ArticleFilters {
  status?: ArticleStatus;
  authorId?: string;
  tagId?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ArticleLock {
  lockedBy: Pick<User, 'id' | 'name'>;
  lockedAt: string;
  expiresAt: string;
}

export interface ArticleHistoryEntry {
  id: string;
  articleId: string;
  modifiedBy: Pick<User, 'id' | 'name'>;
  changes: Record<string, unknown>;
  createdAt: string;
}

// ===== Tag =====
export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface CreateTagPayload {
  name: string;
}

export interface UpdateTagPayload {
  name: string;
}

// ===== Category =====
export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
  createdAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  parentId?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  parentId?: string | null;
}

// ===== Pagination =====
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ===== API Error =====
export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}
