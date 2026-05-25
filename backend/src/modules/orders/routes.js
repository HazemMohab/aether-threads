import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import * as ctrl from './controller.js';

const router = Router();
router.use(authenticate);
router.post('/', [body('shipping_address').isObject()], validate, ctrl.createOrder);
router.get('/', ctrl.getOrders);
router.get('/:id', ctrl.getOrderById);
router.patch('/:id/status', requireAdmin,
  [body('status').isIn(['pending','processing','shipped','delivered','cancelled'])],
  validate, ctrl.updateOrderStatus);
export default router;
