export async function up(knex) {
  const has = await knex.schema.hasColumn('categories', 'parent_id');
  if (!has) {
    await knex.schema.alterTable('categories', (t) => {
      t.integer('parent_id')
        .references('id')
        .inTable('categories')
        .onDelete('SET NULL')
        .nullable();
    });
  }
}

export async function down(knex) {
  const has = await knex.schema.hasColumn('categories', 'parent_id');
  if (has) {
    await knex.schema.alterTable('categories', (t) => {
      t.dropColumn('parent_id');
    });
  }
}
