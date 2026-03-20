import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from './schema';
import { createPool } from './create-pool';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.warn(
    '[db] DATABASE_URL is not set. Database-backed queries will fail until a connection string is configured.'
  );
}

const pool = databaseUrl ? createPool(databaseUrl) : null;

const db = pool ? drizzle(pool, { schema }) : null;

export function getDb() {
  if (!db) {
    throw new Error('DATABASE_URL is not configured');
  }

  return db;
}

export { db };
export { schema };
