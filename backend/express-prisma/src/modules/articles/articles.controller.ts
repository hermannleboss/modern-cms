import { Request, Response, NextFunction } from 'express';
import { ArticleStatus } from '@prisma/client';
import { ArticlesService } from './articles.service';
import { createArticleSchema, updateArticleSchema, updateStatusSchema } from './articles.dto';
import { getParam } from '../../utils/params';

const articlesService = new ArticlesService();

export class ArticlesController {
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as ArticleStatus | undefined;
      const result = await articlesService.findAll(page, limit, status);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await articlesService.findById(getParam(req, 'id'));
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await articlesService.findBySlug(getParam(req, 'slug'));
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = createArticleSchema.parse(req.body);
      const result = await articlesService.create(req.user!.id, dto);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = updateArticleSchema.parse(req.body);
      const result = await articlesService.update(getParam(req, 'id'), req.user!.id, dto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = updateStatusSchema.parse(req.body);
      const result = await articlesService.updateStatus(getParam(req, 'id'), req.user!.id, dto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await articlesService.delete(getParam(req, 'id'), req.user!.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await articlesService.getHistory(getParam(req, 'id'));
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async preview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await articlesService.preview(getParam(req, 'id'));
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async acquireLock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await articlesService.acquireLock(getParam(req, 'id'), req.user!.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async releaseLock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await articlesService.releaseLock(getParam(req, 'id'), req.user!.id);
      res.json({ message: 'Lock released' });
    } catch (error) {
      next(error);
    }
  }

  async forceUnlock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await articlesService.forceUnlock(getParam(req, 'id'));
      res.json({ message: 'Lock forcefully released' });
    } catch (error) {
      next(error);
    }
  }
}
