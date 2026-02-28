import prisma from '../utils/prisma';
import { PermissionAction } from './permissions';

/**
 * Centralized permission check.
 * Effective permissions = role permissions + user-specific permissions.
 */
export async function can(userId: string, action: PermissionAction): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: { permission: true },
          },
        },
      },
      userPermissions: {
        include: { permission: true },
      },
    },
  });

  if (!user || !user.isActive) {
    return false;
  }

  const roleActions = user.role.rolePermissions.map((rp) => rp.permission.action);
  const userActions = user.userPermissions.map((up) => up.permission.action);
  const effectivePermissions = new Set([...roleActions, ...userActions]);

  return effectivePermissions.has(action);
}

/**
 * Get all effective permissions for a user.
 */
export async function getEffectivePermissions(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: { permission: true },
          },
        },
      },
      userPermissions: {
        include: { permission: true },
      },
    },
  });

  if (!user || !user.isActive) {
    return [];
  }

  const roleActions = user.role.rolePermissions.map((rp) => rp.permission.action);
  const userActions = user.userPermissions.map((up) => up.permission.action);
  const effectivePermissions = new Set([...roleActions, ...userActions]);

  return Array.from(effectivePermissions);
}
