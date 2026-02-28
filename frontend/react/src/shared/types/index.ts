export type Permission =
  | 'article.create'
  | 'article.read'
  | 'article.update.own'
  | 'article.update.any'
  | 'article.publish'
  | 'article.archive'
  | 'user.read'
  | 'user.invite'
  | 'user.assign_role'
  | 'category.create'
  | 'category.update'
  | 'category.delete'
  | 'tag.create'
  | 'tag.update'
  | 'tag.delete';

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  roles: Role[];
  permissions: Permission[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
