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
    const { id: roleId } = await params;

    if (!(await hasPermission(auth.userId, "user.assign_role"))) {
      throw new ForbiddenError();
    }

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundError("Role not found");
    }

    const body = await request.json();
    const { permissionIds } = body as { permissionIds: string[] };

    if (!Array.isArray(permissionIds)) {
      throw new ValidationError("permissionIds must be an array");
    }

    const permissions = await prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    });
    if (permissions.length !== permissionIds.length) {
      throw new ValidationError("One or more permission IDs are invalid");
    }

    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { roleId } }),
      ...permissionIds.map((permissionId) =>
        prisma.rolePermission.create({ data: { roleId, permissionId } })
      ),
    ]);

    const updatedRole = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: { include: { permission: true } },
      },
    });

    return NextResponse.json({
      ...updatedRole,
      permissions: updatedRole!.permissions.map((rp) => rp.permission),
    });
  } catch (error) {
    return handleError(error);
  }
}
