import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from './schema';
import { createPool } from './create-pool';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.warn(
    '[db] DATABASE_URL is not set. Database-backed queries will fail until a connection string is configured.'
  );
}

const pool = createPool(databaseUrl);

export const db = drizzle(pool, { schema });
export { schema };
