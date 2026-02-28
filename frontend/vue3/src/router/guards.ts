import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

export function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
): void {
  const isPublic = to.meta.public === true;
  const token = localStorage.getItem('access_token');

  if (isPublic) {
    if (token && to.name === 'login') {
      next('/articles');
    } else {
      next();
    }
    return;
  }

  if (!token) {
    next('/login');
    return;
  }

  // Permission checks are advisory only (frontend suggests, backend decides)
  // The backend enforces all permissions; the frontend uses permission metadata
  // for UX hints (hiding buttons, redirecting) but never as a security boundary.
  next();
}
