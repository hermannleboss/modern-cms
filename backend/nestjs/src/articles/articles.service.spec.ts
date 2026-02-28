import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ArticlesService', () => {
  let service: ArticlesService;

  const mockArticle = {
    id: 'article-1',
    title: 'Test Article',
    slug: 'test-article',
    content: 'Content',
    excerpt: null,
    status: 'draft',
    authorId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    author: { id: 'user-1', firstName: 'Test', lastName: 'User', email: 'test@test.com' },
    coAuthors: [],
    tags: [],
    categories: [],
    lock: null,
  };

  const mockPrismaService = {
    article: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    articleTag: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    articleCategory: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    articleCoAuthor: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    articleRevision: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    articleLock: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an article', async () => {
      mockPrismaService.article.create.mockResolvedValue(mockArticle);
      mockPrismaService.articleRevision.create.mockResolvedValue({});

      const result = await service.create(
        { title: 'Test Article', content: 'Content' },
        'user-1',
      );

      expect(result.title).toBe('Test Article');
      expect(mockPrismaService.article.create).toHaveBeenCalled();
      expect(mockPrismaService.articleRevision.create).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an article', async () => {
      mockPrismaService.article.findUnique.mockResolvedValue(mockArticle);

      const result = await service.findOne('article-1');

      expect(result.id).toBe('article-1');
    });

    it('should throw NotFoundException if article not found', async () => {
      mockPrismaService.article.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update own article with article.update.own permission', async () => {
      mockPrismaService.article.findUnique.mockResolvedValue(mockArticle);
      mockPrismaService.articleLock.findUnique.mockResolvedValue(null);
      mockPrismaService.article.update.mockResolvedValue({
        ...mockArticle,
        title: 'Updated',
      });
      mockPrismaService.articleRevision.create.mockResolvedValue({});

      const result = await service.update(
        'article-1',
        { title: 'Updated' },
        'user-1',
        ['article.update.own'],
      );

      expect(result.title).toBe('Updated');
    });

    it('should throw ForbiddenException without permission', async () => {
      mockPrismaService.article.findUnique.mockResolvedValue(mockArticle);

      await expect(
        service.update('article-1', { title: 'Updated' }, 'other-user', []),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow update with article.update.any permission', async () => {
      mockPrismaService.article.findUnique.mockResolvedValue(mockArticle);
      mockPrismaService.articleLock.findUnique.mockResolvedValue(null);
      mockPrismaService.article.update.mockResolvedValue({
        ...mockArticle,
        title: 'Updated by other',
      });
      mockPrismaService.articleRevision.create.mockResolvedValue({});

      const result = await service.update(
        'article-1',
        { title: 'Updated by other' },
        'other-user',
        ['article.update.any'],
      );

      expect(result.title).toBe('Updated by other');
    });
  });

  describe('updateStatus', () => {
    it('should publish an article with article.publish permission', async () => {
      mockPrismaService.article.findUnique.mockResolvedValue(mockArticle);
      mockPrismaService.article.update.mockResolvedValue({
        ...mockArticle,
        status: 'published',
      });

      const result = await service.updateStatus(
        'article-1',
        'published' as any,
        'user-1',
        ['article.publish'],
      );

      expect(result.status).toBe('published');
    });

    it('should throw ForbiddenException without publish permission', async () => {
      mockPrismaService.article.findUnique.mockResolvedValue(mockArticle);

      await expect(
        service.updateStatus(
          'article-1',
          'published' as any,
          'user-1',
          ['article.read'],
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should archive with article.archive permission', async () => {
      mockPrismaService.article.findUnique.mockResolvedValue(mockArticle);
      mockPrismaService.article.update.mockResolvedValue({
        ...mockArticle,
        status: 'archived',
      });

      const result = await service.updateStatus(
        'article-1',
        'archived' as any,
        'user-1',
        ['article.archive'],
      );

      expect(result.status).toBe('archived');
    });
  });

  describe('acquireLock', () => {
    it('should create a lock when none exists', async () => {
      mockPrismaService.article.findUnique.mockResolvedValue(mockArticle);
      mockPrismaService.articleLock.findUnique.mockResolvedValue(null);

      const lock = {
        id: 'lock-1',
        articleId: 'article-1',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 30 * 60000),
      };
      mockPrismaService.articleLock.create.mockResolvedValue(lock);

      const result = await service.acquireLock('article-1', 'user-1');

      expect(result.articleId).toBe('article-1');
    });

    it('should throw ConflictException when locked by another user', async () => {
      mockPrismaService.article.findUnique.mockResolvedValue(mockArticle);
      mockPrismaService.articleLock.findUnique.mockResolvedValue({
        id: 'lock-1',
        articleId: 'article-1',
        userId: 'other-user',
        expiresAt: new Date(Date.now() + 30 * 60000),
        user: { firstName: 'Other', lastName: 'User' },
      });

      await expect(
        service.acquireLock('article-1', 'user-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should take over expired lock', async () => {
      mockPrismaService.article.findUnique.mockResolvedValue(mockArticle);
      mockPrismaService.articleLock.findUnique.mockResolvedValue({
        id: 'lock-1',
        articleId: 'article-1',
        userId: 'other-user',
        expiresAt: new Date('2020-01-01'),
        user: { firstName: 'Other', lastName: 'User' },
      });
      mockPrismaService.articleLock.delete.mockResolvedValue({});

      const newLock = {
        id: 'lock-2',
        articleId: 'article-1',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 30 * 60000),
      };
      mockPrismaService.articleLock.create.mockResolvedValue(newLock);

      const result = await service.acquireLock('article-1', 'user-1');

      expect(result.userId).toBe('user-1');
      expect(mockPrismaService.articleLock.delete).toHaveBeenCalled();
    });
  });

  describe('releaseLock', () => {
    it('should release own lock', async () => {
      mockPrismaService.articleLock.findUnique.mockResolvedValue({
        id: 'lock-1',
        articleId: 'article-1',
        userId: 'user-1',
      });
      mockPrismaService.articleLock.delete.mockResolvedValue({});

      const result = await service.releaseLock('article-1', 'user-1');

      expect(result!.message).toBe('Lock released');
    });

    it("should throw ForbiddenException when releasing another user's lock", async () => {
      mockPrismaService.articleLock.findUnique.mockResolvedValue({
        id: 'lock-1',
        articleId: 'article-1',
        userId: 'other-user',
      });

      await expect(
        service.releaseLock('article-1', 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should delete own article with update.own permission', async () => {
      mockPrismaService.article.findUnique.mockResolvedValue(mockArticle);
      mockPrismaService.article.delete.mockResolvedValue({});

      const result = await service.delete('article-1', 'user-1', [
        'article.update.own',
      ]);

      expect(result.message).toBe('Article deleted successfully');
    });

    it('should throw ForbiddenException without permission', async () => {
      mockPrismaService.article.findUnique.mockResolvedValue(mockArticle);

      await expect(
        service.delete('article-1', 'other-user', []),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
