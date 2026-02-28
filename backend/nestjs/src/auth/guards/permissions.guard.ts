import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../../common/decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user) {
      const effectivePermissions = await this.getEffectivePermissions(user.id);
      request.userPermissions = effectivePermissions;
    }

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasPermission = requiredPermissions.some((perm) =>
      request.userPermissions.includes(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Missing required permission: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }

  private async getEffectivePermissions(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
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

    if (!user) return [];

    const rolePermissions = user.role.rolePermissions.map(
      (rp) => rp.permission.action,
    );

    const userGranted = user.userPermissions
      .filter((up) => up.granted)
      .map((up) => up.permission.action);

    const userRevoked = user.userPermissions
      .filter((up) => !up.granted)
      .map((up) => up.permission.action);

    const permissionSet = new Set([...rolePermissions, ...userGranted]);
    userRevoked.forEach((p) => permissionSet.delete(p));

    return Array.from(permissionSet);
  }
}
