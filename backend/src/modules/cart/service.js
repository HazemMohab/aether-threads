import db from '../../config/db.js';

export const getCart = async (userId) => {
  const items = await db('cart_items as ci')
    .join('products as p', 'ci.product_id', 'p.id')
    .where('ci.user_id', userId)
    .select(
      'ci.id',
      'ci.quantity',
      'ci.size',
      'ci.color',
      'p.id as product_id',
      'p.name',
      'p.price',
      'p.image_url',
      'p.stock_qty'
    );

  const total = items.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);
  return { items, total };
};

export const addToCart = async (userId, { product_id, quantity = 1, size, color }) => {
  const product = await db('products').where({ id: product_id, is_active: true }).first();
  if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });
  if (product.stock_qty < quantity) throw Object.assign(new Error('Insufficient stock'), { status: 400 });

  if (size && Array.isArray(product.sizes) && !product.sizes.includes(size)) {
    throw Object.assign(new Error('Selected size is not available'), { status: 400 });
  }

  if (color && Array.isArray(product.colors) && !product.colors.includes(color)) {
    throw Object.assign(new Error('Selected color is not available'), { status: 400 });
  }

  const existing = await db('cart_items').where({ user_id: userId, product_id, size, color }).first();
  if (existing) {
    const nextQuantity = existing.quantity + quantity;
    if (product.stock_qty < nextQuantity) throw Object.assign(new Error('Insufficient stock'), { status: 400 });
    const [item] = await db('cart_items').where({ id: existing.id }).update({ quantity: nextQuantity }).returning('*');
    return item;
  }

  const [item] = await db('cart_items').insert({ user_id: userId, product_id, quantity, size, color }).returning('*');
  return item;
};

export const updateCartItem = async (userId, itemId, quantity) => {
  if (quantity < 1) throw Object.assign(new Error('Quantity must be at least 1'), { status: 400 });

  const existing = await db('cart_items as ci')
    .join('products as p', 'ci.product_id', 'p.id')
    .where('ci.id', itemId)
    .where('ci.user_id', userId)
    .select('ci.id', 'p.stock_qty')
    .first();

  if (!existing) throw Object.assign(new Error('Cart item not found'), { status: 404 });
  if (existing.stock_qty < quantity) throw Object.assign(new Error('Insufficient stock'), { status: 400 });

  const [item] = await db('cart_items').where({ id: itemId, user_id: userId }).update({ quantity }).returning('*');
  return item;
};

export const removeCartItem = async (userId, itemId) => {
  const deleted = await db('cart_items').where({ id: itemId, user_id: userId }).del();
  if (!deleted) throw Object.assign(new Error('Cart item not found'), { status: 404 });
};

export const clearCart = async (userId) => db('cart_items').where({ user_id: userId }).del();
