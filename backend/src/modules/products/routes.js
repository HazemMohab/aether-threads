import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { upload } from '../../middleware/upload.js';
import * as ctrl from './controller.js';

const router = Router();

router.get('/', ctrl.getProducts);
router.get('/categories', ctrl.getCategories);

// Image upload — must come before /:slug to avoid route conflicts
router.post(
  '/upload',
  authenticate, requireAdmin,
  upload.single('image'),
  ctrl.uploadImage,
);

router.get('/:slug', ctrl.getProductBySlug);

router.post('/', authenticate, requireAdmin,
  [body('name').trim().notEmpty(), body('price').isFloat({ min: 0 }), body('stock_qty').isInt({ min: 0 })],
  validate, ctrl.createProduct);

router.put('/:id', authenticate, requireAdmin, ctrl.updateProduct);
router.delete('/:id', authenticate, requireAdmin, ctrl.deleteProduct);

export default router;
