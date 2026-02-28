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

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return NextResponse.json(category);
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

    if (!(await hasPermission(auth.userId, "category.update"))) {
      throw new ForbiddenError();
    }

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    const body = await request.json();
    const { name, parentId } = body;

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      const slug = generateSlug(name);
      const slugConflict = await prisma.category.findFirst({
        where: { slug, NOT: { id } },
      });
      if (slugConflict) {
        throw new ValidationError("A category with this name already exists");
      }
      updateData.name = name;
      updateData.slug = slug;
    }

    if (parentId !== undefined) {
      if (parentId === id) {
        throw new ValidationError("A category cannot be its own parent");
      }
      if (parentId !== null) {
        const parent = await prisma.category.findUnique({
          where: { id: parentId },
        });
        if (!parent) {
          throw new ValidationError("Parent category not found");
        }
      }
      updateData.parentId = parentId;
    }

    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
      },
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

    if (!(await hasPermission(auth.userId, "category.delete"))) {
      throw new ForbiddenError();
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: { children: true },
    });

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    if (category.children.length > 0) {
      throw new ValidationError(
        "Cannot delete a category with children. Remove or reassign children first."
      );
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    return handleError(error);
  }
}
