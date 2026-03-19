import { promises as fs } from 'node:fs';
import path from 'node:path';

import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import * as schema from '../lib/db/schema';
import { parseHuntYaml, getFieldValue } from '../lib/yaml-parser';

const PUBLISHED_DIRS = [
  'smoke',
  'auth',
  'forms',
  'admin',
  'e-commerce',
  'saas',
  'accessibility',
];

const FEATURED_HUNTS = [
  'auth/oauth-google.yml',
  'e-commerce/checkout-flow.yml',
  'admin/crud-cycle.yml',
  'saas/team-invite.yml',
  'forms/form-validation.yml',
  'smoke/homepage.yml',
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });

  // Create GIN indexes and search vector index via raw SQL
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_hunts_tags ON hunts USING GIN (tags);
    CREATE INDEX IF NOT EXISTS idx_hunts_search ON hunts USING GIN (
      to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(name, ''))
    );
  `);

  const rootDir = process.cwd();
  let total = 0;
  let errors = 0;

  for (const category of PUBLISHED_DIRS) {
    const categoryPath = path.join(rootDir, category);

    let files: string[];
    try {
      files = await fs.readdir(categoryPath);
    } catch {
      continue;
    }

    const ymlFiles = files.filter((f) => f.endsWith('.yml')).sort();

    for (const file of ymlFiles) {
      const filePath = `${category}/${file}`;
      try {
        const absolutePath = path.join(categoryPath, file);
        const content = await fs.readFile(absolutePath, 'utf8');
        const parsed = parseHuntYaml(content, file);
        const slug = getFieldValue(content, 'name') || file.replace(/\.yml$/, '');

        await db
          .insert(schema.hunts)
          .values({
            slug,
            name: parsed.name,
            title: parsed.title,
            description: parsed.description,
            category,
            filePath,
            tags: parsed.tags,
            steps: parsed.steps,
            assertions: parsed.assertions,
            content,
            stepCount: parsed.stepCount,
            assertionCount: parsed.assertionCount,
            isVerified: true,
            isFeatured: FEATURED_HUNTS.includes(filePath),
          })
          .onConflictDoUpdate({
            target: schema.hunts.slug,
            set: {
              name: parsed.name,
              title: parsed.title,
              description: parsed.description,
              category,
              filePath,
              tags: parsed.tags,
              steps: parsed.steps,
              assertions: parsed.assertions,
              content,
              stepCount: parsed.stepCount,
              assertionCount: parsed.assertionCount,
              isFeatured: FEATURED_HUNTS.includes(filePath),
              updatedAt: new Date(),
            },
          });

        total++;
        console.log(`  [ok] ${filePath}`);
      } catch (err) {
        errors++;
        console.error(`  [FAIL] ${filePath}:`, err);
      }
    }
  }

  console.log(`\nSeeded ${total} hunts (${errors} errors)`);

  await pool.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
