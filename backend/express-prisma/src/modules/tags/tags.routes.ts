import { Router } from 'express';
import { TagsController } from './tags.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permissions.middleware';
import { PERMISSIONS } from '../../permissions/permissions';

const router = Router();
const controller = new TagsController();

router.use(authMiddleware);

router.get('/', requirePermission(PERMISSIONS.TAG_READ), controller.findAll);
router.get('/:id', requirePermission(PERMISSIONS.TAG_READ), controller.findById);
router.post('/', requirePermission(PERMISSIONS.TAG_CREATE), controller.create);
router.put('/:id', requirePermission(PERMISSIONS.TAG_UPDATE), controller.update);
router.delete('/:id', requirePermission(PERMISSIONS.TAG_DELETE), controller.delete);

export default router;
