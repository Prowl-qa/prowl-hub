import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.warn(
    '[db] DATABASE_URL is not set. Database-backed queries will fail until a connection string is configured.'
  );
}

const databaseSsl = process.env.DATABASE_SSL?.toLowerCase();
const shouldUseSsl =
  process.env.NODE_ENV === 'production' ||
  databaseSsl === '1' ||
  databaseSsl === 'true' ||
  databaseSsl === 'require';

const pool = new pg.Pool({
  ...(databaseUrl ? { connectionString: databaseUrl } : {}),
  ...(shouldUseSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool, { schema });
export { schema };
