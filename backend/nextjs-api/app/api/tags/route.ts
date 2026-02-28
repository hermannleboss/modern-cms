import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { handleError, ForbiddenError, ValidationError } from "@/lib/errors";
import { generateSlug } from "@/lib/slug";

export async function GET(request: NextRequest) {
  try {
    authenticate(request);

    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(tags);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = authenticate(request);

    if (!(await hasPermission(auth.userId, "tag.create"))) {
      throw new ForbiddenError();
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      throw new ValidationError("Tag name is required");
    }

    const slug = generateSlug(name);
    const existing = await prisma.tag.findUnique({ where: { slug } });
    if (existing) {
      throw new ValidationError("A tag with this name already exists");
    }

    const tag = await prisma.tag.create({
      data: { name, slug },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
