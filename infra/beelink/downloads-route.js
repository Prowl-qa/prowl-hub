// Express route handlers for /api/downloads
// Add to Beelink Express API alongside existing feedback routes.
//
// Dependencies: pg (already installed), express-rate-limit, rate-limit-postgresql
// Env vars: DATABASE_URL or PG pool config, STATS_API_KEY
//
// Usage in Express app:
//   const downloadsRouter = require('./downloads-route');
//   app.use('/api/downloads', downloadsRouter);

const { Router } = require('express');
const crypto = require('crypto');
const { Pool } = require('pg');

const router = Router();

const pool = new Pool(); // uses DATABASE_URL or PG* env vars

const HUNT_PATH_RE = /^[a-z0-9-]+\/[a-z0-9-]+\.yml$/;
const MAX_FIELD_LEN = 500;
const DAILY_INSERT_CAP = 10_000;
const DAILY_CAP_LOCK_KEY = 4_839_201;

function truncate(value, maxLen) {
  if (typeof value !== 'string') return null;
  return value.slice(0, maxLen);
}

function isAuthorizedBearer(authHeader, expectedKey) {
  if (typeof authHeader !== 'string' || typeof expectedKey !== 'string' || expectedKey.length === 0) {
    return false;
  }

  const expectedHeader = `Bearer ${expectedKey}`;
  const provided = Buffer.from(authHeader, 'utf8');
  const expected = Buffer.from(expectedHeader, 'utf8');

  if (provided.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(provided, expected);
}

// POST /api/downloads — Log a download event
router.post('/', async (req, res) => {
  const { huntPath, category, huntName, userAgent, referer, country } = req.body;

  // Validate required fields
  if (!huntPath || typeof huntPath !== 'string' || !HUNT_PATH_RE.test(huntPath)) {
    return res.status(400).json({ ok: false, error: 'Invalid huntPath' });
  }
  if (!category || typeof category !== 'string' || category.length > 100) {
    return res.status(400).json({ ok: false, error: 'Invalid category' });
  }
  if (!huntName || typeof huntName !== 'string' || huntName.length > 200) {
    return res.status(400).json({ ok: false, error: 'Invalid huntName' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Serialize cap checks + insert with a transaction-scoped advisory lock.
    await client.query('SELECT pg_advisory_xact_lock($1)', [DAILY_CAP_LOCK_KEY]);

    const capCheck = await client.query(
      `SELECT COUNT(*)::int AS cnt FROM hub_downloads WHERE created_at >= CURRENT_DATE`
    );
    if (capCheck.rows[0].cnt >= DAILY_INSERT_CAP) {
      await client.query('ROLLBACK');
      return res.status(503).json({ ok: false, error: 'Daily limit reached' });
    }

    await client.query(
      `INSERT INTO hub_downloads (hunt_path, category, hunt_name, user_agent, referer, country)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        huntPath,
        category.slice(0, 100),
        huntName.slice(0, 200),
        truncate(userAgent, MAX_FIELD_LEN),
        truncate(referer, MAX_FIELD_LEN),
        truncate(country, 2),
      ]
    );

    await client.query('COMMIT');
    return res.status(201).json({ ok: true });
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Ignore rollback failures and return the original insert/query error.
    }
    console.error('[downloads] Insert failed:', err.message);
    return res.status(500).json({ ok: false, error: 'Internal error' });
  } finally {
    client.release();
  }
});

// GET /api/downloads/stats — Aggregated download stats (authenticated)
router.get('/stats', async (req, res) => {
  const authHeader = req.headers.authorization;
  const expectedKey = process.env.STATS_API_KEY;

  if (!isAuthorizedBearer(authHeader, expectedKey)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const {
    hunt,
    category,
    from,
    to,
    group = 'day',
    sort = 'count',
    limit = '50',
  } = req.query;

  const parsedLimit = Math.min(Math.max(1, parseInt(limit, 10) || 50), 200);
  const validGroups = ['day', 'week', 'month'];
  const groupBy = validGroups.includes(group) ? group : 'day';

  const defaultFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const fromDate = from || defaultFrom;
  const toDate = to || new Date().toISOString().slice(0, 10);

  try {
    // Total all-time
    const allTimeResult = await pool.query(`SELECT COUNT(*)::int AS count FROM hub_downloads`);
    const allTime = allTimeResult.rows[0].count;

    // Total for period
    const periodResult = await pool.query(
      `SELECT COUNT(*)::int AS count FROM hub_downloads WHERE created_at >= $1 AND created_at < ($2::date + 1)`,
      [fromDate, toDate]
    );
    const period = periodResult.rows[0].count;

    // Top hunts — with optional filters
    const topFilters = [];
    const topParams = [fromDate, toDate];
    let paramIdx = 3;

    if (hunt) {
      topFilters.push(`hunt_path = $${paramIdx++}`);
      topParams.push(hunt);
    }
    if (category) {
      topFilters.push(`category = $${paramIdx++}`);
      topParams.push(category);
    }

    const topWhere = topFilters.length > 0 ? `AND ${topFilters.join(' AND ')}` : '';
    const topOrder = sort === 'recent' ? 'MAX(created_at) DESC' : 'COUNT(*) DESC';
    topParams.push(parsedLimit);

    const topHuntsResult = await pool.query(
      `SELECT hunt_path AS "huntPath", category, hunt_name AS "huntName", COUNT(*)::int AS count
       FROM hub_downloads
       WHERE created_at >= $1 AND created_at < ($2::date + 1) ${topWhere}
       GROUP BY hunt_path, category, hunt_name
       ORDER BY ${topOrder}
       LIMIT $${paramIdx}`,
      topParams
    );

    // Time series
    const truncExpr =
      groupBy === 'month' ? `date_trunc('month', created_at)` :
      groupBy === 'week'  ? `date_trunc('week', created_at)` :
                            `date_trunc('day', created_at)`;

    const timeSeriesResult = await pool.query(
      `SELECT ${truncExpr}::date AS date, COUNT(*)::int AS count
       FROM hub_downloads
       WHERE created_at >= $1 AND created_at < ($2::date + 1)
       GROUP BY 1
       ORDER BY 1`,
      [fromDate, toDate]
    );

    // By category
    const byCategoryResult = await pool.query(
      `SELECT category, COUNT(*)::int AS count
       FROM hub_downloads
       WHERE created_at >= $1 AND created_at < ($2::date + 1)
       GROUP BY category
       ORDER BY count DESC`,
      [fromDate, toDate]
    );

    return res.json({
      totals: { allTime, period },
      topHunts: topHuntsResult.rows,
      timeSeries: timeSeriesResult.rows,
      byCategory: byCategoryResult.rows,
    });
  } catch (err) {
    console.error('[downloads/stats] Query failed:', err.message);
    return res.status(500).json({ error: 'Internal error' });
  }
});

module.exports = router;
