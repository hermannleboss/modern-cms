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
    const { permissionIds } = body as { permissionIds: string[] };

    if (!Array.isArray(permissionIds)) {
      throw new ValidationError("permissionIds must be an array");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const permissions = await prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    });
    if (permissions.length !== permissionIds.length) {
      throw new ValidationError("One or more permission IDs are invalid");
    }

    await prisma.$transaction([
      prisma.userPermission.deleteMany({ where: { userId } }),
      ...permissionIds.map((permissionId) =>
        prisma.userPermission.create({ data: { userId, permissionId } })
      ),
    ]);

    const updatedPerms = await prisma.userPermission.findMany({
      where: { userId },
      include: { permission: true },
    });

    return NextResponse.json(updatedPerms.map((up) => up.permission));
  } catch (error) {
    return handleError(error);
  }
}
