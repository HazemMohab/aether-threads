export async function up(knex) {
  const hasUnitPrice = await knex.schema.hasColumn('order_items', 'unit_price');
  const hasColor = await knex.schema.hasColumn('order_items', 'color');

  await knex.schema.alterTable('order_items', (table) => {
    if (!hasUnitPrice) {
      table.decimal('unit_price', 10, 2);
    }

    if (!hasColor) {
      table.string('color', 50);
    }
  });

  await knex.raw(`
    UPDATE order_items oi
    SET unit_price = p.price
    FROM products p
    WHERE oi.product_id = p.id
      AND oi.unit_price IS NULL
  `);

  await knex.schema.alterTable('order_items', (table) => {
    table.decimal('unit_price', 10, 2).notNullable().alter();
  });
}

export async function down(knex) {
  const hasUnitPrice = await knex.schema.hasColumn('order_items', 'unit_price');
  const hasColor = await knex.schema.hasColumn('order_items', 'color');

  await knex.schema.alterTable('order_items', (table) => {
    if (hasUnitPrice) {
      table.dropColumn('unit_price');
    }

    if (hasColor) {
      table.dropColumn('color');
    }
  });
}