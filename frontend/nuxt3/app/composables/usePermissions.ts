import type { Permission, User } from '~/types';
import { getEffectivePermissions } from '~/utils/permissions';

export function usePermissions() {
  const { user } = useAuth();

  const effectivePermissions = computed<Permission[]>(() => {
    if (!user.value) return [];
    return getEffectivePermissions(user.value.role, user.value.permissions);
  });

  function hasPermission(permission: Permission): boolean {
    return effectivePermissions.value.includes(permission);
  }

  function hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some((p) => effectivePermissions.value.includes(p));
  }

  function hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every((p) => effectivePermissions.value.includes(p));
  }

  function canEditArticle(article: { author: { id: string } }): boolean {
    if (hasPermission('article.update.any')) return true;
    if (hasPermission('article.update.own') && user.value?.id === article.author.id) return true;
    return false;
  }

  function canDeleteArticle(article: { author: { id: string } }): boolean {
    if (hasPermission('article.delete.any')) return true;
    if (hasPermission('article.delete.own') && user.value?.id === article.author.id) return true;
    return false;
  }

  return {
    effectivePermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canEditArticle,
    canDeleteArticle,
  };
}
