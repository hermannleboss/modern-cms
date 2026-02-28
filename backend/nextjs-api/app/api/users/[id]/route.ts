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

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        roles: { include: { role: { select: { id: true, name: true } } } },
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return NextResponse.json({ ...user, roles: user.roles.map((ur) => ur.role) });
  } catch (error) {
    return handleError(error);
  }
}
