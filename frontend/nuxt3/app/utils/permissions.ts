import type { UserRole, Permission } from '~/types';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'article.create', 'article.read', 'article.update.own', 'article.update.any',
    'article.delete.own', 'article.delete.any', 'article.publish', 'article.archive',
    'user.read', 'user.create', 'user.update', 'user.delete', 'user.invite', 'user.assign_role',
    'category.create', 'category.read', 'category.update', 'category.delete',
    'tag.create', 'tag.read', 'tag.update', 'tag.delete',
    'lock.force_unlock',
  ],
  editor: [
    'article.create', 'article.read', 'article.update.own', 'article.update.any',
    'article.publish', 'article.archive',
    'user.read',
    'category.create', 'category.read', 'category.update',
    'tag.create', 'tag.read', 'tag.update',
    'lock.force_unlock',
  ],
  author: [
    'article.create', 'article.read', 'article.update.own', 'article.delete.own',
    'category.read',
    'tag.create', 'tag.read',
  ],
  contributor: [
    'article.create', 'article.read', 'article.update.own',
    'category.read',
    'tag.read',
  ],
  viewer: [
    'article.read',
    'category.read',
    'tag.read',
  ],
};

export function getEffectivePermissions(role: UserRole, userPermissions: Permission[]): Permission[] {
  const rolePerms = ROLE_PERMISSIONS[role] || [];
  const combined = new Set<Permission>([...rolePerms, ...userPermissions]);
  return Array.from(combined);
}
