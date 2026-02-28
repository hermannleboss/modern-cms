import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { handleError, ForbiddenError, ValidationError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const auth = authenticate(request);

    if (!(await hasPermission(auth.userId, "user.read"))) {
      throw new ForbiddenError();
    }

    const roles = await prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
      },
    });

    return NextResponse.json(
      roles.map((r) => ({
        ...r,
        permissions: r.permissions.map((rp) => rp.permission),
      }))
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = authenticate(request);

    if (!(await hasPermission(auth.userId, "user.assign_role"))) {
      throw new ForbiddenError();
    }

    const body = await request.json();
    const { name, permissionIds } = body as { name: string; permissionIds?: string[] };

    if (!name) {
      throw new ValidationError("Role name is required");
    }

    const existing = await prisma.role.findUnique({ where: { name } });
    if (existing) {
      throw new ValidationError("A role with this name already exists");
    }

    const role = await prisma.role.create({
      data: {
        name,
        permissions: permissionIds
          ? { create: permissionIds.map((permissionId) => ({ permissionId })) }
          : undefined,
      },
      include: {
        permissions: { include: { permission: true } },
      },
    });

    return NextResponse.json(
      { ...role, permissions: role.permissions.map((rp) => rp.permission) },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
