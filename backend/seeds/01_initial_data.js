export async function seed(knex) {
  // ── Clear existing data safely ───────────────────────────────────────────────
  await knex('products').del();

  // Nullify self-referential parent_id before deleting categories
  const hasParent = await knex.schema.hasColumn('categories', 'parent_id');
  if (hasParent) await knex.raw('UPDATE categories SET parent_id = NULL');
  await knex('categories').del();

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const j = (val) => knex.raw('?::jsonb', [JSON.stringify(val)]);

  // Unsplash CDN — confirmed working long-format IDs
  const Q = 'ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80';
  const u = (id) => `https://images.unsplash.com/photo-${id}?${Q}`;

  // ── Insert PARENT categories first ───────────────────────────────────────────
  const [men] = await knex('categories')
    .insert({ name: 'Men', slug: 'men', description: "Men's fashion collection." })
    .returning('*');

  const [women] = await knex('categories')
    .insert({ name: 'Women', slug: 'women', description: "Women's fashion collection." })
    .returning('*');

  // ── Insert SUB-categories ────────────────────────────────────────────────────
  const subs = await knex('categories')
    .insert([
      { name: "Men's T-shirts", slug: 'men-tshirts',    description: "Men's T-shirts and tees.",       parent_id: men.id   },
      { name: "Men's Shirts",   slug: 'men-shirts',     description: "Men's shirts and button-downs.", parent_id: men.id   },
      { name: "Men's Pants",    slug: 'men-pants',      description: "Men's pants and trousers.",      parent_id: men.id   },
      { name: "Women's T-shirts", slug: 'women-tshirts', description: "Women's T-shirts and tees.",    parent_id: women.id },
      { name: "Women's Shirts",   slug: 'women-shirts',  description: "Women's shirts and blouses.",   parent_id: women.id },
      { name: "Women's Pants",    slug: 'women-pants',   description: "Women's pants and trousers.",   parent_id: women.id },
    ])
    .returning('*');

  const cat = Object.fromEntries(subs.map(c => [c.slug, c.id]));

  // ── Placeholder image URLs (replace via Admin > Edit Product > Upload Image) ─
  // These confirmed-working Unsplash photos are stand-ins until you upload
  // your actual TWENTYSEVEN brand photos through the admin panel.
  const BLACK_TEE  = u('1503341504253-dff4815485f1'); // dark tee on model
  const WHITE_TEE  = u('1521572163474-6864f9cf17ab'); // white tee on model
  const LIGHT_TEE  = u('1551488831-00ddcb6c6bd3');    // light-colored top
  const WHITE_POLO = u('1598033129183-c4f50c736f10'); // white collared shirt/polo
  const GRAY_KNIT  = u('1564584217132-2271feaeb3c5'); // gray knit/polo long-format ✓
  const GREEN_TEE  = u('1591047139829-d91aecb6caea'); // dark green oversized tee
  const SAND_TEE   = u('1583743814966-8936f5b7be1a'); // sand/beige washed tee

  // ── PRODUCTS — Men's T-shirts ─────────────────────────────────────────────────
  await knex('products').insert([
    {
      category_id:   cat['men-tshirts'],
      name:          'TWENTYSEVEN SS25 Black Tee',
      slug:          'twentyseven-ss25-black-tee',
      description:   'Oversized premium cotton tee from the TWENTYSEVEN SS25 collection. Features embroidered logo and season branding on the chest. Heavyweight drop-shoulder cut for the perfect oversized streetwear fit.',
      price:         799,
      stock_qty:     50,
      is_new_arrival: true,
      image_url:     BLACK_TEE,
      image_gallery: [BLACK_TEE],
      colors:        j(['Black']),
      sizes:         j(['S', 'M', 'L', 'XL', 'XXL']),
      color_images:  j({ Black: BLACK_TEE }),
    },
    {
      category_id:   cat['men-tshirts'],
      name:          'TWENTYSEVEN 27 Rose Tee',
      slug:          'twentyseven-27-rose-tee',
      description:   'Boxy oversized tee in a soft rose pink colorway. Features tonal 27 logo embroidery on chest. Made from 100% heavyweight cotton for a premium feel and effortless all-day comfort.',
      price:         749,
      stock_qty:     45,
      is_new_arrival: true,
      image_url:     LIGHT_TEE,
      image_gallery: [LIGHT_TEE],
      colors:        j(['Pink']),
      sizes:         j(['S', 'M', 'L', 'XL', 'XXL']),
      color_images:  j({ Pink: LIGHT_TEE }),
    },
    {
      category_id:   cat['men-tshirts'],
      name:          'Spirits of a Dreamer Tee',
      slug:          'spirits-of-a-dreamer-tee',
      description:   'Statement oversized tee featuring the iconic "Spirits of a Dreamer" script print across the chest. 100% premium heavyweight cotton in a relaxed drop-shoulder cut. A signature piece from the TWENTYSEVEN collection.',
      price:         849,
      stock_qty:     40,
      is_new_arrival: true,
      image_url:     WHITE_TEE,
      image_gallery: [WHITE_TEE],
      colors:        j(['White']),
      sizes:         j(['S', 'M', 'L', 'XL', 'XXL']),
      color_images:  j({ White: WHITE_TEE }),
    },
    {
      category_id:   cat['men-tshirts'],
      name:          'TWENTYSEVEN Ribbed Knit Polo',
      slug:          'twentyseven-ribbed-knit-polo',
      description:   'Premium ribbed knit polo with an open-collar design. Fine cotton-blend knit with vertical texture detail. A refined, elevated take on the classic polo engineered for smart casual styling.',
      price:         999,
      stock_qty:     35,
      is_new_arrival: true,
      image_url:     WHITE_POLO,
      image_gallery: [WHITE_POLO],
      colors:        j(['White']),
      sizes:         j(['S', 'M', 'L', 'XL']),
      color_images:  j({ White: WHITE_POLO }),
    },
    {
      category_id:   cat['men-tshirts'],
      name:          'TWENTYSEVEN 27 Graphic Tee',
      slug:          'twentyseven-27-graphic-tee',
      description:   'Oversized graphic tee featuring the bold distressed "27" logo print on the chest. Heavyweight drop-shoulder cut in 100% premium cotton. An everyday essential that defines the TWENTYSEVEN streetwear aesthetic.',
      price:         749,
      stock_qty:     50,
      is_new_arrival: true,
      image_url:     WHITE_TEE,
      image_gallery: [WHITE_TEE],
      colors:        j(['White']),
      sizes:         j(['S', 'M', 'L', 'XL', 'XXL']),
      color_images:  j({ White: WHITE_TEE }),
    },

    // ── 3 new products ────────────────────────────────────────────────────────
    {
      category_id:   cat['men-tshirts'],
      name:          'Salty 023 Knit Polo',
      slug:          'salty-023-knit-polo',
      description:   'Premium short-sleeve knit polo in sage grey with a bold black centre-stripe and "Salty" script logo. Features "023" number embroidery on both sleeves and ribbed black cuffs and hem. A statement-making piece that fuses sportswear heritage with streetwear attitude.',
      price:         1199,
      stock_qty:     30,
      is_new_arrival: true,
      image_url:     GRAY_KNIT,
      image_gallery: [GRAY_KNIT],
      colors:        j(['Gray']),
      sizes:         j(['S', 'M', 'L', 'XL']),
      color_images:  j({ Gray: GRAY_KNIT }),
    },
    {
      category_id:   cat['men-tshirts'],
      name:          'TWENTYSEVEN Established Green Tee',
      slug:          'twentyseven-established-green-tee',
      description:   'Oversized heavyweight tee in deep forest green. Features a tonal script logo on the chest with "TwentySeven — Every Summer Clique, Established, Cairo, Egypt" branding. 100% premium cotton in a relaxed drop-shoulder fit. A true Cairo streetwear staple.',
      price:         799,
      stock_qty:     45,
      is_new_arrival: true,
      image_url:     GREEN_TEE,
      image_gallery: [GREEN_TEE],
      colors:        j(['Green']),
      sizes:         j(['S', 'M', 'L', 'XL', 'XXL']),
      color_images:  j({ Green: GREEN_TEE }),
    },
    {
      category_id:   cat['men-tshirts'],
      name:          'Unknown Desire Acid Wash Tee',
      slug:          'unknown-desire-acid-wash-tee',
      description:   'Heavyweight oversized tee in a sand acid-wash finish. Features the "Unknown Desire" distressed graphic print with a skull motif across the chest. Garment-dyed for a unique vintage texture — no two pieces are exactly alike. 100% premium cotton, boxy streetwear cut.',
      price:         849,
      stock_qty:     40,
      is_new_arrival: true,
      image_url:     SAND_TEE,
      image_gallery: [SAND_TEE],
      colors:        j(['Beige']),
      sizes:         j(['S', 'M', 'L', 'XL', 'XXL']),
      color_images:  j({ Beige: SAND_TEE }),
    },
  ]);
}
