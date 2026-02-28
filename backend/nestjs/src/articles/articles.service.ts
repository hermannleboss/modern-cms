import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateArticleDto,
  UpdateArticleDto,
  ArticleStatus,
} from './dto/article.dto';

@Injectable()
export class ArticlesService {
  private readonly LOCK_TIMEOUT_MINUTES = 30;

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateArticleDto, authorId: string) {
    const slug = this.generateSlug(dto.title);

    const article = await this.prisma.article.create({
      data: {
        title: dto.title,
        slug,
        content: dto.content,
        excerpt: dto.excerpt,
        authorId,
        coAuthors: dto.coAuthorIds
          ? {
              create: dto.coAuthorIds.map((userId) => ({ userId })),
            }
          : undefined,
        tags: dto.tagIds
          ? {
              create: dto.tagIds.map((tagId) => ({ tagId })),
            }
          : undefined,
        categories: dto.categoryIds
          ? {
              create: dto.categoryIds.map((categoryId) => ({ categoryId })),
            }
          : undefined,
      },
      include: this.articleInclude(),
    });

    // Create initial revision
    await this.createRevision(article.id, authorId, dto.title, dto.content, dto.excerpt);

    return article;
  }

  async findAll(status?: string) {
    const where = status ? { status } : {};

    return this.prisma.article.findMany({
      where,
      include: this.articleInclude(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: this.articleInclude(),
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  async findBySlug(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: this.articleInclude(),
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  async update(
    id: string,
    dto: UpdateArticleDto,
    userId: string,
    userPermissions: string[],
  ) {
    const article = await this.findOne(id);

    this.checkUpdatePermission(article, userId, userPermissions);
    await this.checkLock(id, userId);

    const slug = dto.title ? this.generateSlug(dto.title) : undefined;

    const updateData: any = {
      ...(dto.title && { title: dto.title }),
      ...(slug && { slug }),
      ...(dto.content !== undefined && { content: dto.content }),
      ...(dto.excerpt !== undefined && { excerpt: dto.excerpt }),
    };

    // Handle tags update
    if (dto.tagIds !== undefined) {
      await this.prisma.articleTag.deleteMany({ where: { articleId: id } });
      if (dto.tagIds.length > 0) {
        await this.prisma.articleTag.createMany({
          data: dto.tagIds.map((tagId) => ({ articleId: id, tagId })),
        });
      }
    }

    // Handle categories update
    if (dto.categoryIds !== undefined) {
      await this.prisma.articleCategory.deleteMany({ where: { articleId: id } });
      if (dto.categoryIds.length > 0) {
        await this.prisma.articleCategory.createMany({
          data: dto.categoryIds.map((categoryId) => ({ articleId: id, categoryId })),
        });
      }
    }

    // Handle co-authors update
    if (dto.coAuthorIds !== undefined) {
      await this.prisma.articleCoAuthor.deleteMany({ where: { articleId: id } });
      if (dto.coAuthorIds.length > 0) {
        await this.prisma.articleCoAuthor.createMany({
          data: dto.coAuthorIds.map((coAuthorUserId) => ({
            articleId: id,
            userId: coAuthorUserId,
          })),
        });
      }
    }

    const updated = await this.prisma.article.update({
      where: { id },
      data: updateData,
      include: this.articleInclude(),
    });

    // Create revision
    await this.createRevision(
      id,
      userId,
      updated.title,
      updated.content,
      updated.excerpt ?? undefined,
    );

    return updated;
  }

  async updateStatus(
    id: string,
    status: ArticleStatus,
    userId: string,
    userPermissions: string[],
  ) {
    const article = await this.findOne(id);

    this.checkStatusChangePermission(article, status, userId, userPermissions);

    return this.prisma.article.update({
      where: { id },
      data: { status },
      include: this.articleInclude(),
    });
  }

  async delete(
    id: string,
    userId: string,
    userPermissions: string[],
  ) {
    const article = await this.findOne(id);

    const isOwner = article.authorId === userId;
    const canDeleteOwn = isOwner && userPermissions.includes('article.update.own');
    const canDeleteAny = userPermissions.includes('article.update.any');

    if (!canDeleteOwn && !canDeleteAny) {
      throw new ForbiddenException('Insufficient permissions to delete this article');
    }

    await this.prisma.article.delete({ where: { id } });
    return { message: 'Article deleted successfully' };
  }

  // --- Collaborative Locking ---

  async acquireLock(articleId: string, userId: string) {
    await this.findOne(articleId);

    const existingLock = await this.prisma.articleLock.findUnique({
      where: { articleId },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    if (existingLock) {
      if (existingLock.expiresAt < new Date()) {
        // Lock expired, remove it
        await this.prisma.articleLock.delete({ where: { id: existingLock.id } });
      } else if (existingLock.userId !== userId) {
        throw new ConflictException({
          message: 'Article is currently being edited',
          lockedBy: `${existingLock.user.firstName} ${existingLock.user.lastName}`,
          expiresAt: existingLock.expiresAt,
        });
      } else {
        // Same user, extend lock
        return this.prisma.articleLock.update({
          where: { id: existingLock.id },
          data: { expiresAt: this.getLockExpiry() },
        });
      }
    }

    return this.prisma.articleLock.create({
      data: {
        articleId,
        userId,
        expiresAt: this.getLockExpiry(),
      },
    });
  }

  async releaseLock(articleId: string, userId: string) {
    const lock = await this.prisma.articleLock.findUnique({
      where: { articleId },
    });

    if (!lock) return;

    if (lock.userId !== userId) {
      throw new ForbiddenException('You do not hold the lock on this article');
    }

    await this.prisma.articleLock.delete({ where: { id: lock.id } });
    return { message: 'Lock released' };
  }

  async forceReleaseLock(articleId: string) {
    await this.prisma.articleLock.deleteMany({
      where: { articleId },
    });
    return { message: 'Lock force-released' };
  }

  async getRevisions(articleId: string) {
    await this.findOne(articleId);

    return this.prisma.articleRevision.findMany({
      where: { articleId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async preview(id: string) {
    return this.findOne(id);
  }

  // --- Private Helpers ---

  private checkUpdatePermission(
    article: any,
    userId: string,
    userPermissions: string[],
  ) {
    const isOwner = article.authorId === userId;
    const isCoAuthor = article.coAuthors?.some(
      (ca: any) => ca.userId === userId,
    );

    if (userPermissions.includes('article.update.any')) return;
    if (
      (isOwner || isCoAuthor) &&
      userPermissions.includes('article.update.own')
    )
      return;

    throw new ForbiddenException(
      'Insufficient permissions to update this article',
    );
  }

  private checkStatusChangePermission(
    article: any,
    newStatus: ArticleStatus,
    userId: string,
    userPermissions: string[],
  ) {
    switch (newStatus) {
      case ArticleStatus.IN_REVIEW:
        // Author or co-author can submit for review
        const isContributor =
          article.authorId === userId ||
          article.coAuthors?.some((ca: any) => ca.userId === userId);
        if (!isContributor && !userPermissions.includes('article.update.any')) {
          throw new ForbiddenException('Only article contributors can submit for review');
        }
        break;

      case ArticleStatus.PUBLISHED:
        if (!userPermissions.includes('article.publish')) {
          throw new ForbiddenException('Missing article.publish permission');
        }
        break;

      case ArticleStatus.ARCHIVED:
        if (!userPermissions.includes('article.archive')) {
          throw new ForbiddenException('Missing article.archive permission');
        }
        break;

      case ArticleStatus.DRAFT:
        // Reverting to draft - needs update permission
        this.checkUpdatePermission(article, userId, userPermissions);
        break;
    }
  }

  private async checkLock(articleId: string, userId: string) {
    const lock = await this.prisma.articleLock.findUnique({
      where: { articleId },
    });

    if (lock && lock.userId !== userId && lock.expiresAt > new Date()) {
      throw new ConflictException('Article is locked by another user');
    }
  }

  private async createRevision(
    articleId: string,
    userId: string,
    title: string,
    content: string,
    excerpt?: string,
  ) {
    await this.prisma.articleRevision.create({
      data: { articleId, userId, title, content, excerpt },
    });
  }

  private generateSlug(title: string): string {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    const suffix = Date.now().toString(36);
    return `${base}-${suffix}`;
  }

  private getLockExpiry(): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + this.LOCK_TIMEOUT_MINUTES);
    return expiry;
  }

  private articleInclude() {
    return {
      author: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      coAuthors: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      },
      tags: {
        include: { tag: true },
      },
      categories: {
        include: { category: true },
      },
      lock: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      },
    };
  }
}
