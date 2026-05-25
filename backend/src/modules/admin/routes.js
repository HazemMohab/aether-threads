import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import db from '../../config/db.js';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/stats', async (req, res, next) => {
  try {
    const [{ total_orders }] = await db('orders').count('id as total_orders');
    const [{ revenue }] = await db('orders').where('status', '!=', 'cancelled').sum('total as revenue');
    const [{ total_products }] = await db('products').where('is_active', true).count('id as total_products');
    const [{ total_customers }] = await db('users').where('role', 'customer').count('id as total_customers');
    const recent_orders = await db('orders as o')
      .join('users as u', 'o.user_id', 'u.id')
      .select('o.id', 'o.total', 'o.status', 'o.created_at', 'u.full_name', 'u.email')
      .orderBy('o.created_at', 'desc').limit(5);

    res.json({ success: true, data: { total_orders: Number(total_orders), revenue: Number(revenue) || 0, total_products: Number(total_products), total_customers: Number(total_customers), recent_orders } });
  } catch (e) { next(e); }
});

export default router;
