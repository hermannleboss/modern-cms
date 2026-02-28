import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { hasPermission, hasAnyPermission } from "@/lib/permissions";
import {
  handleError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
} from "@/lib/errors";
import { generateSlug } from "@/lib/slug";

const ARTICLE_INCLUDE = {
  author: { select: { id: true, email: true, name: true } },
  coAuthors: {
    include: { user: { select: { id: true, email: true, name: true } } },
  },
  tags: { include: { tag: true } },
  categories: { include: { category: true } },
  lock: {
    include: { user: { select: { id: true, email: true, name: true } } },
  },
};

const VALID_STATUSES = ["draft", "in_review", "published", "archived"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticate(request);
    const { id } = await params;

    if (!(await hasPermission(auth.userId, "article.read"))) {
      throw new ForbiddenError();
    }

    const article = await prisma.article.findUnique({
      where: { id },
      include: ARTICLE_INCLUDE,
    });

    if (!article) {
      throw new NotFoundError("Article not found");
    }

    return NextResponse.json(formatArticle(article));
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

    const article = await prisma.article.findUnique({
      where: { id },
      include: { coAuthors: true, lock: true },
    });

    if (!article) {
      throw new NotFoundError("Article not found");
    }

    // Permission check: update.own or update.any
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

    // Check lock - only the lock holder or admin can edit
    if (article.lock && new Date(article.lock.expiresAt) > new Date()) {
      if (article.lock.userId !== auth.userId) {
        throw new ConflictError(
          "Article is locked by another user. Acquire the lock first."
        );
      }
    }

    const body = await request.json();
    const { title, content, excerpt, status, tagIds, categoryIds } = body;

    // Validate status transitions
    if (status && status !== article.status) {
      if (!VALID_STATUSES.includes(status)) {
        throw new ValidationError(
          `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`
        );
      }

      // Only users with article.publish can set published status
      if (status === "published") {
        if (!(await hasPermission(auth.userId, "article.publish"))) {
          throw new ForbiddenError(
            "You do not have permission to publish articles"
          );
        }
      }

      // Only users with article.archive can set archived status
      if (status === "archived") {
        if (!(await hasPermission(auth.userId, "article.archive"))) {
          throw new ForbiddenError(
            "You do not have permission to archive articles"
          );
        }
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) {
      updateData.title = title;
      const newSlug = generateSlug(title);
      const slugExists = await prisma.article.findFirst({
        where: { slug: newSlug, NOT: { id } },
      });
      updateData.slug = slugExists ? `${newSlug}-${Date.now()}` : newSlug;
    }
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (status !== undefined) updateData.status = status;

    // Update tags
    if (tagIds !== undefined) {
      await prisma.articleTag.deleteMany({ where: { articleId: id } });
      if (tagIds.length > 0) {
        await prisma.articleTag.createMany({
          data: tagIds.map((tagId: string) => ({ articleId: id, tagId })),
        });
      }
    }

    // Update categories
    if (categoryIds !== undefined) {
      await prisma.articleCategory.deleteMany({ where: { articleId: id } });
      if (categoryIds.length > 0) {
        await prisma.articleCategory.createMany({
          data: categoryIds.map((categoryId: string) => ({
            articleId: id,
            categoryId,
          })),
        });
      }
    }

    const updated = await prisma.article.update({
      where: { id },
      data: updateData,
      include: ARTICLE_INCLUDE,
    });

    // Create revision on content/title changes
    if (title !== undefined || content !== undefined) {
      await prisma.articleRevision.create({
        data: {
          articleId: id,
          userId: auth.userId,
          title: updated.title,
          content: updated.content,
          excerpt: updated.excerpt,
        },
      });
    }

    return NextResponse.json(formatArticle(updated));
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

    const article = await prisma.article.findUnique({
      where: { id },
      include: { coAuthors: true },
    });

    if (!article) {
      throw new NotFoundError("Article not found");
    }

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

    await prisma.article.delete({ where: { id } });

    return NextResponse.json({ message: "Article deleted" });
  } catch (error) {
    return handleError(error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatArticle(article: any) {
  return {
    ...article,
    coAuthors:
      article.coAuthors?.map((ca: { user: unknown }) => ca.user) || [],
    tags: article.tags?.map((at: { tag: unknown }) => at.tag) || [],
    categories:
      article.categories?.map((ac: { category: unknown }) => ac.category) ||
      [],
    lock: article.lock
      ? {
          id: article.lock.id,
          user: article.lock.user,
          lockedAt: article.lock.lockedAt,
          expiresAt: article.lock.expiresAt,
          isExpired: new Date(article.lock.expiresAt) < new Date(),
        }
      : null,
  };
}
