import pg from 'pg';

export function createPool(connectionString?: string) {
  const databaseSsl = process.env.DATABASE_SSL?.toLowerCase();
  const shouldUseSsl =
    process.env.NODE_ENV === 'production' ||
    databaseSsl === '1' ||
    databaseSsl === 'true' ||
    databaseSsl === 'require';
  const databaseCaCert = process.env.DATABASE_CA_CERT?.replace(/\\n/g, '\n');

  const sslConfig = shouldUseSsl
    ? databaseCaCert
      ? { rejectUnauthorized: true, ca: databaseCaCert }
      : { rejectUnauthorized: true }
    : undefined;

  return new pg.Pool({
    ...(connectionString ? { connectionString } : {}),
    ...(sslConfig ? { ssl: sslConfig } : {}),
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}
