export const Permission = {
  ARTICLE_CREATE: "article.create",
  ARTICLE_READ: "article.read",
  ARTICLE_UPDATE_OWN: "article.update.own",
  ARTICLE_UPDATE_ANY: "article.update.any",
  ARTICLE_PUBLISH: "article.publish",
  ARTICLE_ARCHIVE: "article.archive",

  USER_READ: "user.read",
  USER_INVITE: "user.invite",
  USER_ASSIGN_ROLE: "user.assign_role",

  CATEGORY_CREATE: "category.create",
  CATEGORY_UPDATE: "category.update",
  CATEGORY_DELETE: "category.delete",

  TAG_CREATE: "tag.create",
  TAG_UPDATE: "tag.update",
  TAG_DELETE: "tag.delete",
} as const;

export type PermissionType = (typeof Permission)[keyof typeof Permission];
