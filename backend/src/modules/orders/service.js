import db from '../../config/db.js';
import { clearCart } from '../cart/service.js';
import { Resend } from 'resend';

const TAX_RATE = 0.14;
const SHIPPING_FEE = 50.00;

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const sendOrderConfirmationEmail = async ({ email, fullName, order, items }) => {
  if (!resend) return; // skip silently if no API key configured

  const orderId = order.id.slice(0, 8).toUpperCase();

  const itemsRows = items.map(i => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;">${i.name}${i.size ? ` — ${i.size}` : ''}${i.color ? ` / ${i.color}` : ''}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${i.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${(parseFloat(i.price) * i.quantity).toFixed(2)} EGP</td>
    </tr>
  `).join('');

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1A1A2E;">
    <div style="background:#1A1A2E;padding:32px;text-align:center;">
      <h1 style="color:#C9A84C;margin:0;letter-spacing:4px;font-size:22px;">AETHER THREADS</h1>
    </div>

    <div style="padding:32px;">
      <h2 style="margin-top:0;">Order Confirmed ✓</h2>
      <p>Hi <strong>${fullName}</strong>,</p>
      <p>Thank you for your order! We've received it and will start processing it shortly.</p>

      <div style="background:#f5f7fa;border-left:4px solid #C9A84C;padding:16px;margin:24px 0;">
        <p style="margin:0;font-size:14px;color:#555;">Order ID</p>
        <p style="margin:4px 0 0;font-size:20px;font-weight:bold;color:#1A1A2E;">#${orderId}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin:24px 0;">
        <thead>
          <tr style="background:#1A1A2E;color:#fff;">
            <th style="padding:10px 12px;text-align:left;font-weight:500;">Item</th>
            <th style="padding:10px 12px;text-align:center;font-weight:500;">Qty</th>
            <th style="padding:10px 12px;text-align:right;font-weight:500;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>

      <div style="text-align:right;border-top:2px solid #1A1A2E;padding-top:16px;">
        <p style="margin:4px 0;color:#555;">Subtotal: <strong>${parseFloat(order.subtotal).toFixed(2)} EGP</strong></p>
        <p style="margin:4px 0;color:#555;">Tax (14%): <strong>${parseFloat(order.tax).toFixed(2)} EGP</strong></p>
        <p style="margin:4px 0;color:#555;">Shipping: <strong>${parseFloat(order.shipping).toFixed(2)} EGP</strong></p>
        <p style="margin:8px 0 0;font-size:18px;color:#1A1A2E;">Total: <strong style="color:#C9A84C;">${parseFloat(order.total).toFixed(2)} EGP</strong></p>
      </div>

      <div style="margin-top:32px;text-align:center;">
        <a href="https://aether-threads-7zmz.vercel.app/account/orders"
           style="background:#1A1A2E;color:#C9A84C;padding:14px 32px;text-decoration:none;font-weight:bold;letter-spacing:1px;display:inline-block;">
          VIEW YOUR ORDERS
        </a>
      </div>
    </div>

    <div style="background:#f5f7fa;padding:20px;text-align:center;font-size:12px;color:#999;">
      <p style="margin:0;">Aether Threads — Contemporary Clothing</p>
    </div>
  </div>`;

  try {
    await resend.emails.send({
      from: 'Aether Threads <orders@aetherthreads.com>',
      to: email,
      subject: `Order Confirmed — #${orderId}`,
      html,
    });
  } catch (err) {
    // Email failure should never block the order — just log it
    console.error('Order confirmation email failed:', err.message);
  }
};

export const createOrder = async (userId, { shipping_address }) => {
  const user = await db('users').where({ id: userId }).select('email', 'full_name').first();

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

  const order = await db.transaction(async (trx) => {
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

  // Send confirmation email (non-blocking — failure won't affect the order)
  sendOrderConfirmationEmail({
    email: user.email,
    fullName: user.full_name,
    order,
    items: cartItems,
  });

  return order;
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
