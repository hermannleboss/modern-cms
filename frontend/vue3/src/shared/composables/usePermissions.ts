import { useAuth } from '@/features/auth/composables/useAuth';

export function usePermissions() {
  const { can, effectivePermissions } = useAuth();

  function canAny(...permissions: string[]): boolean {
    return permissions.some((p) => can(p));
  }

  function canAll(...permissions: string[]): boolean {
    return permissions.every((p) => can(p));
  }

  return {
    can,
    canAny,
    canAll,
    effectivePermissions,
  };
}
