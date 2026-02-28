import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import {
  createUserSchema,
  updateUserSchema,
  assignRoleSchema,
  assignPermissionsSchema,
} from './users.dto';
import { getParam } from '../../utils/params';

const usersService = new UsersService();

export class UsersController {
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await usersService.findAll(page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await usersService.findById(getParam(req, 'id'));
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = createUserSchema.parse(req.body);
      const result = await usersService.create(dto);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = updateUserSchema.parse(req.body);
      const result = await usersService.update(getParam(req, 'id'), dto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await usersService.delete(getParam(req, 'id'));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async assignRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = assignRoleSchema.parse(req.body);
      const result = await usersService.assignRole(getParam(req, 'id'), dto.roleId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async assignPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = assignPermissionsSchema.parse(req.body);
      const result = await usersService.assignPermissions(getParam(req, 'id'), dto.permissionIds);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
