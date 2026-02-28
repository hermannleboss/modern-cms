import { Router } from 'express';
import { UsersController } from './users.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permissions.middleware';
import { PERMISSIONS } from '../../permissions/permissions';

const router = Router();
const controller = new UsersController();

router.use(authMiddleware);

router.get('/', requirePermission(PERMISSIONS.USER_READ), controller.findAll);
router.get('/:id', requirePermission(PERMISSIONS.USER_READ), controller.findById);
router.post('/', requirePermission(PERMISSIONS.USER_CREATE), controller.create);
router.put('/:id', requirePermission(PERMISSIONS.USER_UPDATE), controller.update);
router.delete('/:id', requirePermission(PERMISSIONS.USER_DELETE), controller.delete);
router.patch('/:id/role', requirePermission(PERMISSIONS.USER_ASSIGN_ROLE), controller.assignRole);
router.patch(
  '/:id/permissions',
  requirePermission(PERMISSIONS.USER_ASSIGN_ROLE),
  controller.assignPermissions
);

export default router;
