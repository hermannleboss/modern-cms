import type { ReactNode } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import type { Permission } from '../types';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../utils/permissions';

interface PermissionGuardProps {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { user } = useAuth();

  if (permission) {
    return hasPermission(user, permission) ? <>{children}</> : <>{fallback}</>;
  }

  if (permissions) {
    if (requireAll) {
      return hasAllPermissions(user, permissions) ? <>{children}</> : <>{fallback}</>;
    }
    return hasAnyPermission(user, permissions) ? <>{children}</> : <>{fallback}</>;
  }

  return <>{children}</>;
}
