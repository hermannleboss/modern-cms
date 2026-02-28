export const PERMISSIONS = {
  // Article permissions
  ARTICLE_CREATE: 'article.create',
  ARTICLE_READ: 'article.read',
  ARTICLE_UPDATE_OWN: 'article.update.own',
  ARTICLE_UPDATE_ANY: 'article.update.any',
  ARTICLE_DELETE_OWN: 'article.delete.own',
  ARTICLE_DELETE_ANY: 'article.delete.any',
  ARTICLE_PUBLISH: 'article.publish',
  ARTICLE_ARCHIVE: 'article.archive',

  // User permissions
  USER_READ: 'user.read',
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_INVITE: 'user.invite',
  USER_ASSIGN_ROLE: 'user.assign_role',

  // Category permissions
  CATEGORY_CREATE: 'category.create',
  CATEGORY_READ: 'category.read',
  CATEGORY_UPDATE: 'category.update',
  CATEGORY_DELETE: 'category.delete',

  // Tag permissions
  TAG_CREATE: 'tag.create',
  TAG_READ: 'tag.read',
  TAG_UPDATE: 'tag.update',
  TAG_DELETE: 'tag.delete',

  // Lock permissions
  ARTICLE_LOCK: 'article.lock',
  ARTICLE_FORCE_UNLOCK: 'article.force_unlock',
} as const;

export type PermissionAction = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);
