import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { hasAnyPermission, hasPermission } from "@/lib/permissions";
import {
  handleError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticate(request);
    const { id: articleId } = await params;

    if (!(await hasPermission(auth.userId, "article.read"))) {
      throw new ForbiddenError();
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundError("Article not found");
    }

    const coAuthors = await prisma.articleCoAuthor.findMany({
      where: { articleId },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    return NextResponse.json(coAuthors.map((ca) => ca.user));
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticate(request);
    const { id: articleId } = await params;

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { coAuthors: true },
    });

    if (!article) {
      throw new NotFoundError("Article not found");
    }

    // Only author or users with update.any can manage co-authors
    if (article.authorId !== auth.userId) {
      if (!(await hasPermission(auth.userId, "article.update.any"))) {
        throw new ForbiddenError();
      }
    } else {
      if (
        !(await hasAnyPermission(auth.userId, [
          "article.update.own",
          "article.update.any",
        ]))
      ) {
        throw new ForbiddenError();
      }
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      throw new ValidationError("userId is required");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (userId === article.authorId) {
      throw new ValidationError("Cannot add the primary author as a co-author");
    }

    const existing = article.coAuthors.find((ca) => ca.userId === userId);
    if (existing) {
      throw new ValidationError("User is already a co-author");
    }

    await prisma.articleCoAuthor.create({
      data: { articleId, userId },
    });

    const coAuthors = await prisma.articleCoAuthor.findMany({
      where: { articleId },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    return NextResponse.json(
      coAuthors.map((ca) => ca.user),
      { status: 201 }
    );
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
    const { id: articleId } = await params;

    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundError("Article not found");
    }

    // Only author or users with update.any can manage co-authors
    if (article.authorId !== auth.userId) {
      if (!(await hasPermission(auth.userId, "article.update.any"))) {
        throw new ForbiddenError();
      }
    } else {
      if (
        !(await hasAnyPermission(auth.userId, [
          "article.update.own",
          "article.update.any",
        ]))
      ) {
        throw new ForbiddenError();
      }
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      throw new ValidationError("userId query parameter is required");
    }

    await prisma.articleCoAuthor.deleteMany({
      where: { articleId, userId },
    });

    return NextResponse.json({ message: "Co-author removed" });
  } catch (error) {
    return handleError(error);
  }
}
