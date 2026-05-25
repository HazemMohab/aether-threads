export const config = { transaction: false };

export async function up(knex) {
  const hasImageGallery = await knex.schema.hasColumn('products', 'image_gallery');
  const hasColors = await knex.schema.hasColumn('products', 'colors');
  const hasNewArrival = await knex.schema.hasColumn('products', 'is_new_arrival');
  const hasCartColor = await knex.schema.hasColumn('cart_items', 'color');
  const hasOrderColor = await knex.schema.hasColumn('order_items', 'color');

  await knex.schema.alterTable('products', (t) => {
    if (!hasImageGallery) {
      t.specificType('image_gallery', 'text[]').defaultTo(knex.raw('ARRAY[]::text[]'));
    }

    if (!hasColors) {
      t.specificType('colors', 'text[]').defaultTo(knex.raw("ARRAY['Black']"));
    }

    if (!hasNewArrival) {
      t.boolean('is_new_arrival').notNullable().defaultTo(false);
    }
  });

  await knex.schema.alterTable('cart_items', (t) => {
    if (!hasCartColor) {
      t.string('color', 50);
    }
  });

  await knex.schema.alterTable('order_items', (t) => {
    if (!hasOrderColor) {
      t.string('color', 50);
    }
  });

  await knex.raw(`
    ALTER TABLE cart_items
    DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_size_unique
  `);

  await knex.raw(`
    ALTER TABLE cart_items
    DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_size_color_unique
  `);

  await knex.raw(`
    ALTER TABLE cart_items
    ADD CONSTRAINT cart_items_user_id_product_id_size_color_unique
    UNIQUE (user_id, product_id, size, color)
  `);

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_products_price 
    ON products(price)
  `);

  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_products_new_arrival 
    ON products(is_new_arrival)
  `);
}

export async function down(knex) {
  await knex.raw(`
    ALTER TABLE cart_items
    DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_size_color_unique
  `);

  await knex.raw(`
    ALTER TABLE cart_items
    ADD CONSTRAINT cart_items_user_id_product_id_size_unique
    UNIQUE (user_id, product_id, size)
  `);

  const hasOrderColor = await knex.schema.hasColumn('order_items', 'color');
  const hasCartColor = await knex.schema.hasColumn('cart_items', 'color');
  const hasImageGallery = await knex.schema.hasColumn('products', 'image_gallery');
  const hasColors = await knex.schema.hasColumn('products', 'colors');
  const hasNewArrival = await knex.schema.hasColumn('products', 'is_new_arrival');

  await knex.schema.alterTable('order_items', (t) => {
    if (hasOrderColor) {
      t.dropColumn('color');
    }
  });

  await knex.schema.alterTable('cart_items', (t) => {
    if (hasCartColor) {
      t.dropColumn('color');
    }
  });

  await knex.schema.alterTable('products', (t) => {
    if (hasImageGallery) {
      t.dropColumn('image_gallery');
    }

    if (hasColors) {
      t.dropColumn('colors');
    }

    if (hasNewArrival) {
      t.dropColumn('is_new_arrival');
    }
  });
}