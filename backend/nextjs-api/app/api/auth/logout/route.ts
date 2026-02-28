import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { handleError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const user = authenticate(request);

    const body = await request.json().catch(() => ({}));
    const { refreshToken } = body as { refreshToken?: string };

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    } else {
      await prisma.refreshToken.deleteMany({ where: { userId: user.userId } });
    }

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    return handleError(error);
  }
}
