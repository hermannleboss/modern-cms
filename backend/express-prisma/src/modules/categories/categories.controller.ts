import { Request, Response, NextFunction } from 'express';
import { CategoriesService } from './categories.service';
import { createCategorySchema, updateCategorySchema } from './categories.dto';
import { getParam } from '../../utils/params';

const categoriesService = new CategoriesService();

export class CategoriesController {
  async findAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoriesService.findAll();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoriesService.findById(getParam(req, 'id'));
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = createCategorySchema.parse(req.body);
      const result = await categoriesService.create(dto);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = updateCategorySchema.parse(req.body);
      const result = await categoriesService.update(getParam(req, 'id'), dto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await categoriesService.delete(getParam(req, 'id'));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
