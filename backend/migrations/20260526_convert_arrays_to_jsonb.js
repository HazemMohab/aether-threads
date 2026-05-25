export async function up(knex) {
  await knex.raw(`
    ALTER TABLE products
      ALTER COLUMN colors TYPE jsonb USING to_jsonb(colors),
      ALTER COLUMN sizes  TYPE jsonb USING to_jsonb(sizes),
      ALTER COLUMN image_gallery TYPE jsonb USING to_jsonb(image_gallery)
  `);
}

export async function down(knex) {
  await knex.raw(`
    ALTER TABLE products
      ALTER COLUMN colors TYPE text[] USING ARRAY(SELECT jsonb_array_elements_text(colors)),
      ALTER COLUMN sizes  TYPE text[] USING ARRAY(SELECT jsonb_array_elements_text(sizes)),
      ALTER COLUMN image_gallery TYPE text[] USING ARRAY(SELECT jsonb_array_elements_text(image_gallery))
  `);
}
