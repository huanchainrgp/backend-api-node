import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function ensureMigrations() {
  // Create users table if not exists
  const createUsers = `
    create table if not exists users (
      id uuid primary key default gen_random_uuid(),
      email text unique not null,
      password_hash text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `;

  // Ensure pgcrypto for gen_random_uuid on Neon (extension name may be pgcrypto or uuid-ossp)
  const enablePgcrypto = `create extension if not exists pgcrypto;`;

  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query(enablePgcrypto);
    await client.query(createUsers);
    await client.query('commit');
  } catch (e) {
    await client.query('rollback');
    throw e;
  } finally {
    client.release();
  }
}


