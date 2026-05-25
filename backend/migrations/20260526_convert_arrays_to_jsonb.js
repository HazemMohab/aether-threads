export async function up(knex) {
  // Drop defaults first, then convert types, then set new jsonb defaults
  await knex.raw(`
    ALTER TABLE products
      ALTER COLUMN colors       DROP DEFAULT,
      ALTER COLUMN sizes        DROP DEFAULT,
      ALTER COLUMN image_gallery DROP DEFAULT
  `);
  await knex.raw(`
    ALTER TABLE products
      ALTER COLUMN colors        TYPE jsonb USING to_jsonb(colors),
      ALTER COLUMN sizes         TYPE jsonb USING to_jsonb(sizes),
      ALTER COLUMN image_gallery TYPE jsonb USING to_jsonb(image_gallery)
  `);
  await knex.raw(`
    ALTER TABLE products
      ALTER COLUMN colors        SET DEFAULT '["Black"]'::jsonb,
      ALTER COLUMN sizes         SET DEFAULT '["XS","S","M","L","XL"]'::jsonb,
      ALTER COLUMN image_gallery SET DEFAULT '[]'::jsonb
  `);
}

export async function down(knex) {
  await knex.raw(`
    ALTER TABLE products
      ALTER COLUMN colors        DROP DEFAULT,
      ALTER COLUMN sizes         DROP DEFAULT,
      ALTER COLUMN image_gallery DROP DEFAULT
  `);
  await knex.raw(`
    ALTER TABLE products
      ALTER COLUMN colors        TYPE text[] USING ARRAY(SELECT jsonb_array_elements_text(colors)),
      ALTER COLUMN sizes         TYPE text[] USING ARRAY(SELECT jsonb_array_elements_text(sizes)),
      ALTER COLUMN image_gallery TYPE text[] USING ARRAY(SELECT jsonb_array_elements_text(image_gallery))
  `);
  await knex.raw(`
    ALTER TABLE products
      ALTER COLUMN colors        SET DEFAULT ARRAY['Black'],
      ALTER COLUMN sizes         SET DEFAULT ARRAY['XS','S','M','L','XL'],
      ALTER COLUMN image_gallery SET DEFAULT ARRAY[]::text[]
  `);
}
