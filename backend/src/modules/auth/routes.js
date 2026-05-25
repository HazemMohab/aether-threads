import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import * as ctrl from './controller.js';

const router = Router();

const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { success: false, message: 'Too many requests' } });

router.post('/register', authLimiter,
  [body('email').isEmail().normalizeEmail(),
   body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
   body('full_name').trim().notEmpty().withMessage('Full name is required')],
  validate, ctrl.register);

router.post('/login', authLimiter,
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate, ctrl.login);

router.post('/refresh', ctrl.refresh);
router.post('/logout', authenticate, ctrl.logout);
router.get('/me', authenticate, ctrl.getProfile);

export default router;
