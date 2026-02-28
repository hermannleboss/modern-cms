import { Request, Response, NextFunction } from 'express';
import { TagsService } from './tags.service';
import { createTagSchema, updateTagSchema } from './tags.dto';
import { getParam } from '../../utils/params';

const tagsService = new TagsService();

export class TagsController {
  async findAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await tagsService.findAll();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await tagsService.findById(getParam(req, 'id'));
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = createTagSchema.parse(req.body);
      const result = await tagsService.create(dto);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = updateTagSchema.parse(req.body);
      const result = await tagsService.update(getParam(req, 'id'), dto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await tagsService.delete(getParam(req, 'id'));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
