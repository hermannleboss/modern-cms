import { getStoredTokens } from '~/utils/api';

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;

  const tokens = getStoredTokens();
  const isAuthenticated = !!tokens?.accessToken;

  const publicRoutes = ['/login', '/'];

  if (!isAuthenticated && !publicRoutes.includes(to.path)) {
    return navigateTo('/login');
  }

  if (isAuthenticated && to.path === '/login') {
    return navigateTo('/admin/articles');
  }
});
