import { Router } from 'express';
import { ArticlesController } from './articles.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permissions.middleware';
import { PERMISSIONS } from '../../permissions/permissions';

const router = Router();
const controller = new ArticlesController();

router.use(authMiddleware);

// CRUD
router.get('/', requirePermission(PERMISSIONS.ARTICLE_READ), controller.findAll);
router.get('/:id', requirePermission(PERMISSIONS.ARTICLE_READ), controller.findById);
router.get('/slug/:slug', requirePermission(PERMISSIONS.ARTICLE_READ), controller.findBySlug);
router.post('/', requirePermission(PERMISSIONS.ARTICLE_CREATE), controller.create);
router.put('/:id', controller.update); // ownership check done in service
router.patch('/:id/status', controller.updateStatus); // permission check done in service
router.delete('/:id', controller.delete); // ownership check done in service

// History & Preview
router.get('/:id/history', requirePermission(PERMISSIONS.ARTICLE_READ), controller.getHistory);
router.get('/:id/preview', requirePermission(PERMISSIONS.ARTICLE_READ), controller.preview);

// Locking
router.post('/:id/lock', requirePermission(PERMISSIONS.ARTICLE_LOCK), controller.acquireLock);
router.delete('/:id/lock', requirePermission(PERMISSIONS.ARTICLE_LOCK), controller.releaseLock);
router.delete(
  '/:id/lock/force',
  requirePermission(PERMISSIONS.ARTICLE_FORCE_UNLOCK),
  controller.forceUnlock
);

export default router;
