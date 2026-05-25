import db from '../../config/db.js';
import { slugify } from '../../utils/slug.js';

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const getProducts = async ({
  category,
  type,          // 'tops' | 'bottoms'
  search,
  size,
  color,
  minPrice,
  maxPrice,
  newArrival,
  sort = 'newest',
  page = 1,
  limit = 12,
}) => {
  const safePage = toPositiveInt(page, 1);
  const safeLimit = Math.min(toPositiveInt(limit, 12), 48);
  const offset = (safePage - 1) * safeLimit;

  let query = db('products as p')
    .leftJoin('categories as c', 'p.category_id', 'c.id')
    .leftJoin('categories as parent', 'c.parent_id', 'parent.id')
    .where('p.is_active', true)
    .select(
      'p.*',
      'c.name as category_name',
      'c.slug as category_slug',
      'parent.name as parent_category_name',
      'parent.slug as parent_category_slug',
    );

  // type=tops  → all *-tshirts + *-shirts categories
  // type=bottoms → all *-pants categories
  if (type && !category) {
    const slugPatterns = type === 'tops'
      ? ['%tshirts%', '%shirts%']
      : type === 'bottoms'
        ? ['%pants%']
        : [];
    if (slugPatterns.length) {
      const cats = await db('categories').where(b => {
        slugPatterns.forEach(p => b.orWhere('slug', 'like', p));
      }).select('id');
      query = query.whereIn('p.category_id', cats.map(c => c.id));
    }
  }

  if (category) {
    // Resolve whether the slug is a parent or child category
    const cat = await db('categories').where('slug', category).first();
    if (cat) {
      if (cat.parent_id === null) {
        // Parent category: include products from all child categories (and parent itself)
        const children = await db('categories').where('parent_id', cat.id).select('id');
        const allIds = [cat.id, ...children.map(c => c.id)];
        query = query.whereIn('p.category_id', allIds);
      } else {
        // Child category: filter directly
        query = query.where('p.category_id', cat.id);
      }
    }
  }
  if (search) {
    query = query.where((builder) => {
      builder.whereILike('p.name', `%${search}%`).orWhereILike('p.description', `%${search}%`);
    });
  }
  if (size) query = query.whereRaw('p.sizes @> jsonb_build_array(?::text)', [size]);
  if (color) query = query.whereRaw('p.colors @> jsonb_build_array(?::text)', [color]);
  if (minPrice) query = query.where('p.price', '>=', Number(minPrice));
  if (maxPrice) query = query.where('p.price', '<=', Number(maxPrice));
  if (newArrival === 'true' || newArrival === true) query = query.where('p.is_new_arrival', true);

  const [{ count }] = await query.clone().clearSelect().count('p.id as count');

  switch (sort) {
    case 'price-low':
      query = query.orderBy('p.price', 'asc');
      break;
    case 'price-high':
      query = query.orderBy('p.price', 'desc');
      break;
    case 'name-az':
      query = query.orderBy('p.name', 'asc');
      break;
    case 'newest':
    default:
      query = query.orderBy('p.created_at', 'desc');
      break;
  }

  const products = await query.limit(safeLimit).offset(offset);

  return {
    products,
    total: Number(count),
    page: safePage,
    limit: safeLimit,
    pages: Math.ceil(Number(count) / safeLimit),
  };
};

export const getProductBySlug = async (slug) => {
  const product = await db('products as p')
    .leftJoin('categories as c', 'p.category_id', 'c.id')
    .leftJoin('categories as parent', 'c.parent_id', 'parent.id')
    .where('p.slug', slug)
    .where('p.is_active', true)
    .select(
      'p.*',
      'c.name as category_name',
      'c.slug as category_slug',
      'parent.name as parent_category_name',
      'parent.slug as parent_category_slug',
    )
    .first();

  if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });
  return product;
};

/**
 * Returns categories as a hierarchy tree.
 * Parent categories include a `children` array of their subcategories.
 */
export const getCategories = async () => {
  const all = await db('categories').orderBy('name');
  const map = {};
  all.forEach(c => { map[c.id] = { ...c, children: [] }; });
  const tree = [];
  all.forEach(c => {
    if (c.parent_id && map[c.parent_id]) {
      map[c.parent_id].children.push(map[c.id]);
    } else {
      tree.push(map[c.id]);
    }
  });
  return tree;
};

export const createProduct = async (data) => {
  const slug = slugify(data.name);
  const [product] = await db('products').insert({ ...data, slug }).returning('*');
  return product;
};

export const updateProduct = async (id, data) => {
  if (data.name) data.slug = slugify(data.name);
  const [product] = await db('products').where({ id }).update(data).returning('*');
  if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });
  return product;
};

export const deleteProduct = async (id) => {
  const [product] = await db('products').where({ id }).update({ is_active: false }).returning('id');
  if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });
};
