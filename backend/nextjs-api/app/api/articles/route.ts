import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { handleError, ForbiddenError, ValidationError } from "@/lib/errors";
import { generateSlug } from "@/lib/slug";

const ARTICLE_INCLUDE = {
  author: { select: { id: true, email: true, name: true } },
  coAuthors: { include: { user: { select: { id: true, email: true, name: true } } } },
  tags: { include: { tag: true } },
  categories: { include: { category: true } },
  lock: { include: { user: { select: { id: true, email: true, name: true } } } },
};

export async function GET(request: NextRequest) {
  try {
    const auth = authenticate(request);

    if (!(await hasPermission(auth.userId, "article.read"))) {
      throw new ForbiddenError();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: ARTICLE_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      data: articles.map(formatArticle),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = authenticate(request);

    if (!(await hasPermission(auth.userId, "article.create"))) {
      throw new ForbiddenError();
    }

    const body = await request.json();
    const { title, content, excerpt, tagIds, categoryIds } = body;

    if (!title || !content) {
      throw new ValidationError("Title and content are required");
    }

    let slug = generateSlug(title);
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || "",
        status: "draft",
        authorId: auth.userId,
        tags: tagIds?.length
          ? { create: tagIds.map((tagId: string) => ({ tagId })) }
          : undefined,
        categories: categoryIds?.length
          ? { create: categoryIds.map((categoryId: string) => ({ categoryId })) }
          : undefined,
      },
      include: ARTICLE_INCLUDE,
    });

    // Create initial revision
    await prisma.articleRevision.create({
      data: {
        articleId: article.id,
        userId: auth.userId,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
      },
    });

    return NextResponse.json(formatArticle(article), { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatArticle(article: any) {
  return {
    ...article,
    coAuthors: article.coAuthors?.map((ca: { user: unknown }) => ca.user) || [],
    tags: article.tags?.map((at: { tag: unknown }) => at.tag) || [],
    categories: article.categories?.map((ac: { category: unknown }) => ac.category) || [],
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
