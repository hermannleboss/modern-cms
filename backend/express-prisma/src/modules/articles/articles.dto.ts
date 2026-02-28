import { z } from 'zod';
import { ArticleStatus } from '@prisma/client';

export const createArticleSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  status: z.nativeEnum(ArticleStatus).optional().default(ArticleStatus.DRAFT),
  coAuthorIds: z.array(z.string().uuid()).optional().default([]),
  categoryIds: z.array(z.string().uuid()).optional().default([]),
  tagIds: z.array(z.string().uuid()).optional().default([]),
});

export const updateArticleSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  coAuthorIds: z.array(z.string().uuid()).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(ArticleStatus),
});

export type CreateArticleDto = z.infer<typeof createArticleSchema>;
export type UpdateArticleDto = z.infer<typeof updateArticleSchema>;
export type UpdateStatusDto = z.infer<typeof updateStatusSchema>;
