import db from '../../config/db.js';
import { clearCart } from '../cart/service.js';

const TAX_RATE = 0.14;
const SHIPPING_FEE = 50.00;

export const createOrder = async (userId, { shipping_address }) => {
  const cartItems = await db('cart_items as ci')
    .join('products as p', 'ci.product_id', 'p.id')
    .where('ci.user_id', userId)
    .select('ci.*', 'p.price', 'p.name', 'p.stock_qty');

  if (!cartItems.length) throw Object.assign(new Error('Cart is empty'), { status: 400 });

  for (const item of cartItems) {
    if (item.stock_qty < item.quantity)
      throw Object.assign(new Error(`Insufficient stock for ${item.name}`), { status: 400 });
  }

  const subtotal = cartItems.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);
  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const total = parseFloat((subtotal + tax + SHIPPING_FEE).toFixed(2));

  return await db.transaction(async (trx) => {
    const [order] = await trx('orders').insert({
      user_id: userId, subtotal, tax, shipping: SHIPPING_FEE, total,
      shipping_address: JSON.stringify(shipping_address),
    }).returning('*');

    await trx('order_items').insert(
      cartItems.map(i => ({ order_id: order.id, product_id: i.product_id, quantity: i.quantity, size: i.size, color: i.color, unit_price: i.price }))
    );

    for (const item of cartItems) {
      await trx('products').where({ id: item.product_id }).decrement('stock_qty', item.quantity);
    }

    await trx('cart_items').where({ user_id: userId }).del();
    return order;
  });
};

export const getOrders = async (userId, role) => {
  let query = db('orders as o').join('users as u', 'o.user_id', 'u.id')
    .select('o.*', 'u.full_name', 'u.email').orderBy('o.created_at', 'desc');
  if (role !== 'admin') query = query.where('o.user_id', userId);
  return query;
};

export const getOrderById = async (id, userId, role) => {
  const order = await db('orders').where({ id }).first();
  if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });
  if (role !== 'admin' && order.user_id !== userId)
    throw Object.assign(new Error('Forbidden'), { status: 403 });

  const items = await db('order_items as oi')
    .join('products as p', 'oi.product_id', 'p.id')
    .where('oi.order_id', id)
    .select('oi.*', 'p.name', 'p.image_url', 'p.slug');

  return { ...order, items };
};

export const updateOrderStatus = async (id, status) => {
  const [order] = await db('orders').where({ id }).update({ status }).returning('*');
  if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });
  return order;
};
