import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        roles: { include: { role: { select: { id: true, name: true } } } },
      },
    });

    return NextResponse.json(
      users.map((u) => ({ ...u, roles: u.roles.map((ur) => ur.role) }))
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = authenticate(request);

    if (!(await hasPermission(auth.userId, "user.invite"))) {
      throw new ForbiddenError();
    }

    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      throw new ValidationError("Email, password, and name are required");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ValidationError("A user with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
