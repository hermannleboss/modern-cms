import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { handleError, ForbiddenError, NotFoundError } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticate(request);
    const { id } = await params;

    if (!(await hasPermission(auth.userId, "user.read"))) {
      throw new ForbiddenError();
    }

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: { include: { permission: true } },
      },
    });

    if (!role) {
      throw new NotFoundError("Role not found");
    }

    return NextResponse.json({
      ...role,
      permissions: role.permissions.map((rp) => rp.permission),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticate(request);
    const { id } = await params;

    if (!(await hasPermission(auth.userId, "user.assign_role"))) {
      throw new ForbiddenError();
    }

    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundError("Role not found");
    }

    await prisma.role.delete({ where: { id } });

    return NextResponse.json({ message: "Role deleted" });
  } catch (error) {
    return handleError(error);
  }
}
