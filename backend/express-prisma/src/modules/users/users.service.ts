import prisma from '../../utils/prisma';
import { hashPassword } from '../../utils/password';
import { AppError } from '../../middlewares/error.middleware';
import { CreateUserDto, UpdateUserDto } from './users.dto';

export class UsersService {
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        include: { role: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    return {
      data: users.map(this.toDto),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return this.toDto(user);
  }

  async create(dto: CreateUserDto) {
    const existingUser = await prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }

    const role = await prisma.role.findUnique({ where: { id: dto.roleId } });
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    const hashedPassword = await hashPassword(dto.password);

    const user = await prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        roleId: dto.roleId,
      },
      include: { role: true },
    });

    return this.toDto(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: dto.email } });
      if (existing) {
        throw new AppError('Email already in use', 409);
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: dto,
      include: { role: true },
    });

    return this.toDto(updated);
  }

  async delete(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await prisma.user.delete({ where: { id } });
  }

  async assignRole(userId: string, roleId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { roleId },
      include: { role: true },
    });

    return this.toDto(updated);
  }

  async assignPermissions(userId: string, permissionIds: string[]) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify all permissions exist
    const permissions = await prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    });
    if (permissions.length !== permissionIds.length) {
      throw new AppError('One or more permissions not found', 404);
    }

    // Replace user permissions atomically
    await prisma.$transaction([
      prisma.userPermission.deleteMany({ where: { userId } }),
      ...permissionIds.map((permissionId) =>
        prisma.userPermission.create({
          data: { userId, permissionId },
        })
      ),
    ]);

    return { message: 'Permissions updated successfully' };
  }

  private toDto(user: any) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      role: user.role ? { id: user.role.id, name: user.role.name } : undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
