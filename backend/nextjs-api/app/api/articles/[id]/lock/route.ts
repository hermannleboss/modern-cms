import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { hasAnyPermission, hasPermission } from "@/lib/permissions";
import {
  handleError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from "@/lib/errors";

const LOCK_DURATION_MINUTES = 30;
const MS_PER_MINUTE = 60 * 1000;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticate(request);
    const { id: articleId } = await params;

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { lock: true, coAuthors: true },
    });

    if (!article) {
      throw new NotFoundError("Article not found");
    }

    // Check edit permissions
    const isOwner =
      article.authorId === auth.userId ||
      article.coAuthors.some((ca) => ca.userId === auth.userId);

    if (isOwner) {
      if (
        !(await hasAnyPermission(auth.userId, [
          "article.update.own",
          "article.update.any",
        ]))
      ) {
        throw new ForbiddenError();
      }
    } else {
      if (!(await hasPermission(auth.userId, "article.update.any"))) {
        throw new ForbiddenError();
      }
    }

    // Check existing lock
    if (article.lock) {
      const isExpired = new Date(article.lock.expiresAt) < new Date();
      if (!isExpired && article.lock.userId !== auth.userId) {
        throw new ConflictError("Article is already locked by another user");
      }
      // Remove expired or own lock before creating new one
      await prisma.articleLock.delete({ where: { id: article.lock.id } });
    }

    const lock = await prisma.articleLock.create({
      data: {
        articleId,
        userId: auth.userId,
        expiresAt: new Date(
          Date.now() + LOCK_DURATION_MINUTES * MS_PER_MINUTE
        ),
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });

    return NextResponse.json({
      id: lock.id,
      user: lock.user,
      lockedAt: lock.lockedAt,
      expiresAt: lock.expiresAt,
    });
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
      include: { lock: true },
    });

    if (!article) {
      throw new NotFoundError("Article not found");
    }

    if (!article.lock) {
      return NextResponse.json({ message: "Article is not locked" });
    }

    // Lock holder can always unlock
    if (article.lock.userId === auth.userId) {
      await prisma.articleLock.delete({ where: { id: article.lock.id } });
      return NextResponse.json({ message: "Lock released" });
    }

    // Admin force-unlock: check for article.update.any permission
    if (await hasPermission(auth.userId, "article.update.any")) {
      await prisma.articleLock.delete({ where: { id: article.lock.id } });
      return NextResponse.json({ message: "Lock force-released by admin" });
    }

    throw new ForbiddenError("You cannot unlock this article");
  } catch (error) {
    return handleError(error);
  }
}
