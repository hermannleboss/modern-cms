import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { handleError, ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { generateSlug } from "@/lib/slug";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    authenticate(request);
    const { id } = await params;

    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundError("Tag not found");
    }

    return NextResponse.json(tag);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticate(request);
    const { id } = await params;

    if (!(await hasPermission(auth.userId, "tag.update"))) {
      throw new ForbiddenError();
    }

    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundError("Tag not found");
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      throw new ValidationError("Tag name is required");
    }

    const slug = generateSlug(name);
    const slugConflict = await prisma.tag.findFirst({
      where: { slug, NOT: { id } },
    });
    if (slugConflict) {
      throw new ValidationError("A tag with this name already exists");
    }

    const updated = await prisma.tag.update({
      where: { id },
      data: { name, slug },
    });

    return NextResponse.json(updated);
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

    if (!(await hasPermission(auth.userId, "tag.delete"))) {
      throw new ForbiddenError();
    }

    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundError("Tag not found");
    }

    await prisma.tag.delete({ where: { id } });

    return NextResponse.json({ message: "Tag deleted" });
  } catch (error) {
    return handleError(error);
  }
}
