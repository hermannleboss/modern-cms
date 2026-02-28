import { Request, Response, NextFunction } from 'express';
import { can } from '../permissions/can';
import { PermissionAction } from '../permissions/permissions';

/**
 * Middleware factory: checks that the authenticated user has the required permission.
 * Must be used after authMiddleware.
 */
export function requirePermission(action: PermissionAction) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const hasPermission = await can(req.user.id, action);

    if (!hasPermission) {
      res.status(403).json({ error: 'Insufficient permissions', required: action });
      return;
    }

    next();
  };
}
