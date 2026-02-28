import { prisma } from "./prisma";

/**
 * Get effective permissions for a user (roles + direct user permissions).
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const [rolePermissions, userPermissions] = await Promise.all([
    prisma.rolePermission.findMany({
      where: { role: { users: { some: { userId } } } },
      include: { permission: true },
    }),
    prisma.userPermission.findMany({
      where: { userId },
      include: { permission: true },
    }),
  ]);

  const permissionSet = new Set<string>();
  for (const rp of rolePermissions) {
    permissionSet.add(rp.permission.action);
  }
  for (const up of userPermissions) {
    permissionSet.add(up.permission.action);
  }

  return Array.from(permissionSet);
}

/**
 * Check if user has the required permission.
 */
export async function hasPermission(userId: string, action: string): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(action);
}

/**
 * Check if user has any of the required permissions.
 */
export async function hasAnyPermission(userId: string, actions: string[]): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return actions.some((action) => permissions.includes(action));
}
