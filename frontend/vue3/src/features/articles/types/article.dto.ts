export interface ArticleAuthorDto {
  id: string;
  name: string;
  email: string;
}

export interface ArticleLockDto {
  locked_by: ArticleAuthorDto;
  locked_at: string;
  expires_at: string;
}

export interface ArticleHistoryEntryDto {
  id: string;
  edited_by: ArticleAuthorDto;
  edited_at: string;
  summary: string;
}

export interface ArticleDto {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: string;
  author: ArticleAuthorDto;
  co_authors: ArticleAuthorDto[];
  category_id: string | null;
  tags: string[];
  lock: ArticleLockDto | null;
  history: ArticleHistoryEntryDto[];
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface ArticleListDto {
  data: ArticleDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface CreateArticleDto {
  title: string;
  content: string;
  excerpt: string;
  category_id?: string | null;
  tags?: string[];
  co_author_ids?: string[];
}

export interface UpdateArticleDto extends Partial<CreateArticleDto> {
  status?: string;
}
