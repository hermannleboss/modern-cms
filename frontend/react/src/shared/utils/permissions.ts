import type { Permission, User } from '../types';

export function getEffectivePermissions(user: User): Permission[] {
  const rolePermissions = user.roles.flatMap((role) => role.permissions);
  const allPermissions = [...rolePermissions, ...user.permissions];
  return [...new Set(allPermissions)];
}

export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false;
  return getEffectivePermissions(user).includes(permission);
}

export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
  if (!user) return false;
  const effective = getEffectivePermissions(user);
  return permissions.some((p) => effective.includes(p));
}

export function hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
  if (!user) return false;
  const effective = getEffectivePermissions(user);
  return permissions.every((p) => effective.includes(p));
}

export function canEditArticle(user: User | null, authorId: string): boolean {
  if (!user) return false;
  if (hasPermission(user, 'article.update.any')) return true;
  if (hasPermission(user, 'article.update.own') && user.id === authorId) return true;
  return false;
}
