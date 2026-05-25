export async function up(knex) {
  const has = await knex.schema.hasColumn('products', 'color_images');
  if (!has) {
    await knex.schema.alterTable('products', (t) => {
      t.jsonb('color_images').defaultTo('{}');
    });
  }
}

export async function down(knex) {
  const has = await knex.schema.hasColumn('products', 'color_images');
  if (has) {
    await knex.schema.alterTable('products', (t) => {
      t.dropColumn('color_images');
    });
  }
}
