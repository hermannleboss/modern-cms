import { z } from 'zod';

export const createTagSchema = z.object({
  name: z.string().min(1).max(100),
});

export const updateTagSchema = z.object({
  name: z.string().min(1).max(100),
});

export type CreateTagDto = z.infer<typeof createTagSchema>;
export type UpdateTagDto = z.infer<typeof updateTagSchema>;
