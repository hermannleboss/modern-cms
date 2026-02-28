"use client";

import { useAuth } from "@/lib/providers/AuthProvider";
import { hasPermission, hasAnyPermission } from "@/lib/auth/permissions";
import type { PermissionType } from "@/types";
import type { ReactNode } from "react";

interface PermissionGuardProps {
  children: ReactNode;
  permission?: PermissionType;
  permissions?: PermissionType[];
  mode?: "all" | "any";
  fallback?: ReactNode;
}

/**
 * Client-side permission guard for UI visibility.
 * The backend is the ultimate authority on authorization.
 */
export function PermissionGuard({
  children,
  permission,
  permissions,
  mode = "any",
  fallback = null,
}: PermissionGuardProps) {
  const { user } = useAuth();

  if (!user) return <>{fallback}</>;

  if (permission) {
    return hasPermission(user, permission) ? <>{children}</> : <>{fallback}</>;
  }

  if (permissions) {
    if (mode === "any") {
      return hasAnyPermission(user, permissions) ? (
        <>{children}</>
      ) : (
        <>{fallback}</>
      );
    }
    return permissions.every((p) => hasPermission(user, p)) ? (
      <>{children}</>
    ) : (
      <>{fallback}</>
    );
  }

  return <>{children}</>;
}
