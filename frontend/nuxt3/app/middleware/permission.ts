import type { Permission } from '~/types';

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;

  const requiredPermission = to.meta.permission as Permission | undefined;
  if (!requiredPermission) return;

  const { hasPermission } = usePermissions();

  if (!hasPermission(requiredPermission)) {
    return navigateTo('/admin/articles');
  }
});
