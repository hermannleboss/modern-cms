"use client";

import { useAuth } from "@/lib/providers/AuthProvider";
import {
  hasPermission,
  hasAnyPermission,
  canEditArticle,
} from "@/lib/auth/permissions";
import type { PermissionType } from "@/types";

export function usePermissions() {
  const { user } = useAuth();

  return {
    has: (permission: PermissionType) => hasPermission(user, permission),
    hasAny: (permissions: PermissionType[]) =>
      hasAnyPermission(user, permissions),
    canEditArticle: (articleAuthorId: string) =>
      canEditArticle(user, articleAuthorId),
  };
}
