export type { PaginationParams, PaginatedResponse } from './pagination';

export type Permission =
  | 'article.create'
  | 'article.read'
  | 'article.update.own'
  | 'article.update.any'
  | 'article.publish'
  | 'article.archive'
  | 'article.delete'
  | 'user.read'
  | 'user.invite'
  | 'user.assign_role'
  | 'category.create'
  | 'category.update'
  | 'category.delete'
  | 'tag.create'
  | 'tag.update'
  | 'tag.delete';
