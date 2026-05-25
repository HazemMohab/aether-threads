import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as ctrl from './controller.js';

const router = Router();
router.use(authenticate);
router.get('/', ctrl.getCart);
router.post('/', ctrl.addToCart);
router.patch('/:itemId', ctrl.updateCartItem);
router.delete('/:itemId', ctrl.removeCartItem);
export default router;
