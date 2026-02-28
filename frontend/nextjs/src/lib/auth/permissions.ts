import type { User, PermissionType } from "@/types";

/**
 * Compute effective permissions from user roles + direct permissions.
 * The backend is the authority; this is for UI-level suggestions only.
 */
export function getEffectivePermissions(user: User): string[] {
  const rolePermissions = user.roles.flatMap((role) => role.permissions);
  const allPermissions = new Set([...rolePermissions, ...user.permissions]);
  return Array.from(allPermissions);
}

/**
 * Check if a user has a specific permission.
 * This is a UI hint only — the backend enforces actual authorization.
 */
export function hasPermission(
  user: User | null,
  permission: PermissionType,
): boolean {
  if (!user) return false;
  const effective = getEffectivePermissions(user);
  return effective.includes(permission);
}

/**
 * Check if a user has any of the specified permissions.
 */
export function hasAnyPermission(
  user: User | null,
  permissions: PermissionType[],
): boolean {
  if (!user) return false;
  return permissions.some((p) => hasPermission(user, p));
}

/**
 * Check if a user has all of the specified permissions.
 */
export function hasAllPermissions(
  user: User | null,
  permissions: PermissionType[],
): boolean {
  if (!user) return false;
  return permissions.every((p) => hasPermission(user, p));
}

/**
 * Check if the user can edit a specific article (own vs any).
 */
export function canEditArticle(
  user: User | null,
  articleAuthorId: string,
): boolean {
  if (!user) return false;
  if (hasPermission(user, "article.update.any")) return true;
  if (
    hasPermission(user, "article.update.own") &&
    user.id === articleAuthorId
  ) {
    return true;
  }
  return false;
}
