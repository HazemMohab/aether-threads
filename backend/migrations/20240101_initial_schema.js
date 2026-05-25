export async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');

  await knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('email', 255).unique().notNullable();
    t.text('password_hash').notNullable();
    t.string('full_name', 255).notNullable();
    t.enu('role', ['customer', 'admin']).notNullable().defaultTo('customer');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('categories', (t) => {
    t.increments('id').primary();
    t.string('name', 100).unique().notNullable();
    t.string('slug', 100).unique().notNullable();
    t.text('description');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('products', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.integer('category_id').references('id').inTable('categories').onDelete('SET NULL');
    t.string('name', 255).notNullable();
    t.string('slug', 255).unique().notNullable();
    t.text('description');
    t.decimal('price', 10, 2).notNullable();
    t.integer('stock_qty').notNullable().defaultTo(0);
    t.text('image_url');
    t.specificType('image_gallery', 'text[]').defaultTo(knex.raw("ARRAY[]::text[]"));
    t.specificType('sizes', 'text[]').defaultTo(knex.raw("ARRAY['XS','S','M','L','XL']"));
    t.specificType('colors', 'text[]').defaultTo(knex.raw("ARRAY['Black']"));
    t.boolean('is_new_arrival').notNullable().defaultTo(false);
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamps(true, true);
  });

  await knex.schema.createTable('cart_items', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    t.uuid('product_id').references('id').inTable('products').onDelete('CASCADE');
    t.integer('quantity').notNullable().defaultTo(1);
    t.string('size', 10);
    t.string('color', 50);
    t.timestamps(true, true);
    t.unique(['user_id', 'product_id', 'size', 'color']);
  });

  await knex.schema.createTable('orders', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    t.enu('status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
      .notNullable().defaultTo('pending');
    t.decimal('subtotal', 10, 2).notNullable();
    t.decimal('tax', 10, 2).notNullable();
    t.decimal('shipping', 10, 2).notNullable().defaultTo(50.00);
    t.decimal('total', 10, 2).notNullable();
    t.jsonb('shipping_address').notNullable();
    t.timestamps(true, true);
  });

  await knex.schema.createTable('order_items', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE');
    t.uuid('product_id').references('id').inTable('products').onDelete('SET NULL');
    t.integer('quantity').notNullable();
    t.string('size', 10);
    t.string('color', 50);
    t.decimal('unit_price', 10, 2).notNullable();
    t.timestamps(true, true);
  });

  // Indexes
  await knex.raw('CREATE INDEX idx_products_category ON products(category_id)');
  await knex.raw('CREATE INDEX idx_products_active ON products(is_active)');
  await knex.raw('CREATE INDEX idx_products_price ON products(price)');
  await knex.raw('CREATE INDEX idx_products_new_arrival ON products(is_new_arrival)');
  await knex.raw('CREATE INDEX idx_cart_user ON cart_items(user_id)');
  await knex.raw('CREATE INDEX idx_orders_user ON orders(user_id)');
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('order_items');
  await knex.schema.dropTableIfExists('orders');
  await knex.schema.dropTableIfExists('cart_items');
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('categories');
  await knex.schema.dropTableIfExists('users');
}
