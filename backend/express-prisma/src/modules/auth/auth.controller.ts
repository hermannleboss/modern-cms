import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { loginSchema, refreshSchema } from './auth.dto';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = loginSchema.parse(req.body);
      const result = await authService.login(dto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = refreshSchema.parse(req.body);
      const result = await authService.refresh(dto.refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = refreshSchema.parse(req.body);
      await authService.logout(dto.refreshToken);
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.getMe(req.user!.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
