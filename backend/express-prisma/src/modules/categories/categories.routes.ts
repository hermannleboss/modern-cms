import { Router } from 'express';
import { CategoriesController } from './categories.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permissions.middleware';
import { PERMISSIONS } from '../../permissions/permissions';

const router = Router();
const controller = new CategoriesController();

router.use(authMiddleware);

router.get('/', requirePermission(PERMISSIONS.CATEGORY_READ), controller.findAll);
router.get('/:id', requirePermission(PERMISSIONS.CATEGORY_READ), controller.findById);
router.post('/', requirePermission(PERMISSIONS.CATEGORY_CREATE), controller.create);
router.put('/:id', requirePermission(PERMISSIONS.CATEGORY_UPDATE), controller.update);
router.delete('/:id', requirePermission(PERMISSIONS.CATEGORY_DELETE), controller.delete);

export default router;
