import bcrypt from 'bcrypt';

export async function up(knex) {
  const users = [
    {
      email: 'admin@aetherthreads.com',
      full_name: 'Admin',
      password: 'Admin123!',
      role: 'admin',
    },
    {
      email: 'customer@example.com',
      full_name: 'Demo Customer',
      password: 'Customer123!',
      role: 'user',
    },
  ];

  for (const u of users) {
    const existing = await knex('users').where({ email: u.email }).first();
    if (!existing) {
      const password_hash = await bcrypt.hash(u.password, 10);
      await knex('users').insert({
        email: u.email,
        full_name: u.full_name,
        password_hash,
        role: u.role,
      });
      console.log(`Created user: ${u.email}`);
    } else {
      console.log(`User already exists, skipping: ${u.email}`);
    }
  }
}

export async function down(knex) {
  await knex('users')
    .whereIn('email', ['admin@aetherthreads.com', 'customer@example.com'])
    .delete();
}
