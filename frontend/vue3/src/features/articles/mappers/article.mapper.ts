import type {
  Article,
  ArticleAuthor,
  ArticleLock,
  ArticleHistoryEntry,
  ArticleStatus,
  CreateArticlePayload,
  UpdateArticlePayload,
} from '../types/article.model';
import type {
  ArticleDto,
  ArticleAuthorDto,
  ArticleLockDto,
  ArticleHistoryEntryDto,
  CreateArticleDto,
  UpdateArticleDto,
} from '../types/article.dto';

function mapAuthorDtoToModel(dto: ArticleAuthorDto): ArticleAuthor {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
  };
}

function mapLockDtoToModel(dto: ArticleLockDto): ArticleLock {
  return {
    lockedBy: mapAuthorDtoToModel(dto.locked_by),
    lockedAt: dto.locked_at,
    expiresAt: dto.expires_at,
  };
}

function mapHistoryDtoToModel(dto: ArticleHistoryEntryDto): ArticleHistoryEntry {
  return {
    id: dto.id,
    editedBy: mapAuthorDtoToModel(dto.edited_by),
    editedAt: dto.edited_at,
    summary: dto.summary,
  };
}

export function mapArticleDtoToModel(dto: ArticleDto): Article {
  return {
    id: dto.id,
    title: dto.title,
    slug: dto.slug,
    content: dto.content,
    excerpt: dto.excerpt,
    status: dto.status as ArticleStatus,
    author: mapAuthorDtoToModel(dto.author),
    coAuthors: dto.co_authors.map(mapAuthorDtoToModel),
    categoryId: dto.category_id,
    tags: dto.tags,
    lock: dto.lock ? mapLockDtoToModel(dto.lock) : null,
    history: dto.history?.map(mapHistoryDtoToModel) ?? [],
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    publishedAt: dto.published_at,
  };
}

export function mapCreatePayloadToDto(payload: CreateArticlePayload): CreateArticleDto {
  return {
    title: payload.title,
    content: payload.content,
    excerpt: payload.excerpt,
    category_id: payload.categoryId,
    tags: payload.tags,
    co_author_ids: payload.coAuthorIds,
  };
}

export function mapUpdatePayloadToDto(payload: UpdateArticlePayload): UpdateArticleDto {
  const dto: UpdateArticleDto = {};
  if (payload.title !== undefined) dto.title = payload.title;
  if (payload.content !== undefined) dto.content = payload.content;
  if (payload.excerpt !== undefined) dto.excerpt = payload.excerpt;
  if (payload.categoryId !== undefined) dto.category_id = payload.categoryId;
  if (payload.tags !== undefined) dto.tags = payload.tags;
  if (payload.coAuthorIds !== undefined) dto.co_author_ids = payload.coAuthorIds;
  if (payload.status !== undefined) dto.status = payload.status;
  return dto;
}
