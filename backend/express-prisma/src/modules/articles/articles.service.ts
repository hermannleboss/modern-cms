import { ArticleStatus, Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { can } from '../../permissions/can';
import { PERMISSIONS } from '../../permissions/permissions';
import { slugify } from '../../utils/slugify';
import { config } from '../../config';
import { CreateArticleDto, UpdateArticleDto, UpdateStatusDto } from './articles.dto';

type ArticleWithRelations = Prisma.ArticleGetPayload<{
  include: {
    author: { select: { id: true; firstName: true; lastName: true; email: true } };
    coAuthors: {
      include: {
        user: { select: { id: true; firstName: true; lastName: true; email: true } };
      };
    };
    categories: { include: { category: true } };
    tags: { include: { tag: true } };
    lock: {
      include: {
        user: { select: { id: true; firstName: true; lastName: true } };
      };
    };
  };
}>;

export class ArticlesService {
  async findAll(page = 1, limit = 20, status?: ArticleStatus) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: { select: { id: true, firstName: true, lastName: true, email: true } },
          coAuthors: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
          lock: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.article.count({ where }),
    ]);

    return {
      data: articles.map(this.toDto),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const article = await this.getArticleOrThrow(id);
    return this.toDto(article);
  }

  async findBySlug(slug: string) {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: this.fullInclude(),
    });

    if (!article) {
      throw new AppError('Article not found', 404);
    }

    return this.toDto(article);
  }

  async create(userId: string, dto: CreateArticleDto) {
    const slug = await this.generateUniqueSlug(dto.title);

    const article = await prisma.article.create({
      data: {
        title: dto.title,
        content: dto.content,
        excerpt: dto.excerpt,
        slug,
        status: dto.status || ArticleStatus.DRAFT,
        authorId: userId,
        coAuthors: {
          create: dto.coAuthorIds.map((uid) => ({ userId: uid })),
        },
        categories: {
          create: dto.categoryIds.map((categoryId) => ({ categoryId })),
        },
        tags: {
          create: dto.tagIds.map((tagId) => ({ tagId })),
        },
      },
      include: this.fullInclude(),
    });

    // Record in history
    await this.recordHistory(article.id, userId, article);

    return this.toDto(article);
  }

  async update(articleId: string, userId: string, dto: UpdateArticleDto) {
    const article = await this.getArticleOrThrow(articleId);

    // Check ownership-based permission
    const isOwner = article.authorId === userId ||
      article.coAuthors.some((ca) => ca.userId === userId);
    const canUpdateAny = await can(userId, PERMISSIONS.ARTICLE_UPDATE_ANY);
    const canUpdateOwn = await can(userId, PERMISSIONS.ARTICLE_UPDATE_OWN);

    if (!canUpdateAny && !(canUpdateOwn && isOwner)) {
      throw new AppError('You do not have permission to update this article', 403);
    }

    // Check lock
    await this.checkLock(articleId, userId);

    const updateData: Prisma.ArticleUpdateInput = {};
    if (dto.title) {
      updateData.title = dto.title;
      updateData.slug = await this.generateUniqueSlug(dto.title, articleId);
    }
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.excerpt !== undefined) updateData.excerpt = dto.excerpt;

    const updated = await prisma.$transaction(async (tx) => {
      // Update co-authors if provided
      if (dto.coAuthorIds !== undefined) {
        await tx.articleCoAuthor.deleteMany({ where: { articleId } });
        for (const uid of dto.coAuthorIds) {
          await tx.articleCoAuthor.create({ data: { articleId, userId: uid } });
        }
      }

      // Update categories if provided
      if (dto.categoryIds !== undefined) {
        await tx.articleCategoryAssignment.deleteMany({ where: { articleId } });
        for (const categoryId of dto.categoryIds) {
          await tx.articleCategoryAssignment.create({ data: { articleId, categoryId } });
        }
      }

      // Update tags if provided
      if (dto.tagIds !== undefined) {
        await tx.articleTagAssignment.deleteMany({ where: { articleId } });
        for (const tagId of dto.tagIds) {
          await tx.articleTagAssignment.create({ data: { articleId, tagId } });
        }
      }

      return tx.article.update({
        where: { id: articleId },
        data: updateData,
        include: this.fullInclude(),
      });
    });

    // Record in history
    await this.recordHistory(articleId, userId, updated);

    return this.toDto(updated);
  }

  async updateStatus(articleId: string, userId: string, dto: UpdateStatusDto) {
    const article = await this.getArticleOrThrow(articleId);

    // Validate status transitions
    this.validateStatusTransition(article.status, dto.status);

    // Check specific permissions for publish and archive
    if (dto.status === ArticleStatus.PUBLISHED) {
      const canPublish = await can(userId, PERMISSIONS.ARTICLE_PUBLISH);
      if (!canPublish) {
        throw new AppError('You do not have permission to publish articles', 403);
      }
    }

    if (dto.status === ArticleStatus.ARCHIVED) {
      const canArchive = await can(userId, PERMISSIONS.ARTICLE_ARCHIVE);
      if (!canArchive) {
        throw new AppError('You do not have permission to archive articles', 403);
      }
    }

    const updateData: Prisma.ArticleUpdateInput = { status: dto.status };
    if (dto.status === ArticleStatus.PUBLISHED) {
      updateData.publishedAt = new Date();
    }

    const updated = await prisma.article.update({
      where: { id: articleId },
      data: updateData,
      include: this.fullInclude(),
    });

    await this.recordHistory(articleId, userId, updated);

    return this.toDto(updated);
  }

  async delete(articleId: string, userId: string) {
    const article = await this.getArticleOrThrow(articleId);

    const isOwner = article.authorId === userId;
    const canDeleteAny = await can(userId, PERMISSIONS.ARTICLE_DELETE_ANY);
    const canDeleteOwn = await can(userId, PERMISSIONS.ARTICLE_DELETE_OWN);

    if (!canDeleteAny && !(canDeleteOwn && isOwner)) {
      throw new AppError('You do not have permission to delete this article', 403);
    }

    await prisma.article.delete({ where: { id: articleId } });
  }

  async getHistory(articleId: string) {
    await this.getArticleOrThrow(articleId);

    const history = await prisma.articleHistory.findMany({
      where: { articleId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { changedAt: 'desc' },
    });

    return history;
  }

  async preview(articleId: string) {
    const article = await this.getArticleOrThrow(articleId);
    return this.toDto(article);
  }

  // --- Collaborative Locking ---

  async acquireLock(articleId: string, userId: string) {
    await this.getArticleOrThrow(articleId);

    const existingLock = await prisma.articleLock.findUnique({
      where: { articleId },
    });

    if (existingLock) {
      // Check if lock has expired
      if (existingLock.expiresAt > new Date()) {
        if (existingLock.userId === userId) {
          // Refresh the lock
          const expiresAt = new Date();
          expiresAt.setMinutes(expiresAt.getMinutes() + config.lockTimeoutMinutes);

          const updated = await prisma.articleLock.update({
            where: { id: existingLock.id },
            data: { expiresAt },
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          });

          return updated;
        }

        throw new AppError('Article is currently locked by another user', 409);
      }

      // Lock expired, delete it
      await prisma.articleLock.delete({ where: { id: existingLock.id } });
    }

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + config.lockTimeoutMinutes);

    const lock = await prisma.articleLock.create({
      data: {
        articleId,
        userId,
        expiresAt,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return lock;
  }

  async releaseLock(articleId: string, userId: string) {
    const lock = await prisma.articleLock.findUnique({
      where: { articleId },
    });

    if (!lock) {
      throw new AppError('No lock found for this article', 404);
    }

    if (lock.userId !== userId) {
      throw new AppError('You can only release your own lock', 403);
    }

    await prisma.articleLock.delete({ where: { id: lock.id } });
  }

  async forceUnlock(articleId: string) {
    const lock = await prisma.articleLock.findUnique({
      where: { articleId },
    });

    if (!lock) {
      throw new AppError('No lock found for this article', 404);
    }

    await prisma.articleLock.delete({ where: { id: lock.id } });
  }

  // --- Private helpers ---

  private async getArticleOrThrow(id: string) {
    const article = await prisma.article.findUnique({
      where: { id },
      include: this.fullInclude(),
    });

    if (!article) {
      throw new AppError('Article not found', 404);
    }

    return article;
  }

  private async checkLock(articleId: string, userId: string) {
    const lock = await prisma.articleLock.findUnique({
      where: { articleId },
    });

    if (lock && lock.expiresAt > new Date() && lock.userId !== userId) {
      throw new AppError('Article is locked by another user', 423);
    }
  }

  private validateStatusTransition(current: ArticleStatus, target: ArticleStatus) {
    const validTransitions: Record<ArticleStatus, ArticleStatus[]> = {
      [ArticleStatus.DRAFT]: [ArticleStatus.IN_REVIEW],
      [ArticleStatus.IN_REVIEW]: [ArticleStatus.DRAFT, ArticleStatus.PUBLISHED],
      [ArticleStatus.PUBLISHED]: [ArticleStatus.ARCHIVED, ArticleStatus.DRAFT],
      [ArticleStatus.ARCHIVED]: [ArticleStatus.DRAFT],
    };

    if (!validTransitions[current]?.includes(target)) {
      throw new AppError(
        `Invalid status transition from ${current} to ${target}`,
        422
      );
    }
  }

  private async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
    let slug = slugify(title);
    let counter = 0;
    let candidateSlug = slug;

    while (true) {
      const existing = await prisma.article.findUnique({
        where: { slug: candidateSlug },
      });

      if (!existing || existing.id === excludeId) {
        return candidateSlug;
      }

      counter++;
      candidateSlug = `${slug}-${counter}`;
    }
  }

  private async recordHistory(articleId: string, userId: string, article: ArticleWithRelations) {
    await prisma.articleHistory.create({
      data: {
        articleId,
        userId,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        status: article.status,
      },
    });
  }

  private fullInclude() {
    return {
      author: { select: { id: true, firstName: true, lastName: true, email: true } },
      coAuthors: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      lock: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    };
  }

  private toDto(article: ArticleWithRelations) {
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      status: article.status,
      publishedAt: article.publishedAt,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      author: article.author,
      coAuthors: article.coAuthors?.map((ca) => ca.user) || [],
      categories: article.categories?.map((ac) => ac.category) || [],
      tags: article.tags?.map((at) => at.tag) || [],
      lock: article.lock
        ? {
            lockedBy: article.lock.user,
            lockedAt: article.lock.lockedAt,
            expiresAt: article.lock.expiresAt,
          }
        : null,
    };
  }
}
