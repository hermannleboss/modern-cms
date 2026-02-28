import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { handleError, ForbiddenError, ValidationError } from "@/lib/errors";
import { generateSlug } from "@/lib/slug";

export async function GET(request: NextRequest) {
  try {
    authenticate(request);

    const categories = await prisma.category.findMany({
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = authenticate(request);

    if (!(await hasPermission(auth.userId, "category.create"))) {
      throw new ForbiddenError();
    }

    const body = await request.json();
    const { name, parentId } = body;

    if (!name) {
      throw new ValidationError("Category name is required");
    }

    const slug = generateSlug(name);
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new ValidationError("A category with this name already exists");
    }

    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw new ValidationError("Parent category not found");
      }
    }

    const category = await prisma.category.create({
      data: { name, slug, parentId: parentId || null },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
