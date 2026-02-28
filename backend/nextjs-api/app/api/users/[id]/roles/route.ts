import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { handleError, ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticate(request);
    const { id: userId } = await params;

    if (!(await hasPermission(auth.userId, "user.assign_role"))) {
      throw new ForbiddenError();
    }

    const body = await request.json();
    const { roleIds } = body as { roleIds: string[] };

    if (!Array.isArray(roleIds)) {
      throw new ValidationError("roleIds must be an array");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const roles = await prisma.role.findMany({ where: { id: { in: roleIds } } });
    if (roles.length !== roleIds.length) {
      throw new ValidationError("One or more role IDs are invalid");
    }

    await prisma.$transaction([
      prisma.userRole.deleteMany({ where: { userId } }),
      ...roleIds.map((roleId) =>
        prisma.userRole.create({ data: { userId, roleId } })
      ),
    ]);

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        roles: { include: { role: { select: { id: true, name: true } } } },
      },
    });

    return NextResponse.json({
      ...updatedUser,
      roles: updatedUser!.roles.map((ur) => ur.role),
    });
  } catch (error) {
    return handleError(error);
  }
}
