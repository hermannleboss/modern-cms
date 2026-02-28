import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { handleError } from "@/lib/errors";
import { getUserPermissions } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  try {
    const auth = authenticate(request);

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        roles: { include: { role: { select: { id: true, name: true } } } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const permissions = await getUserPermissions(user.id);

    return NextResponse.json({
      ...user,
      roles: user.roles.map((ur) => ur.role),
      permissions,
    });
  } catch (error) {
    return handleError(error);
  }
}
