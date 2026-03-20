import { promises as fs } from 'node:fs';
import path from 'node:path';

import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import { FEATURED_HUNT_IDS } from '../lib/featured';
import * as schema from '../lib/db/schema';
import { parseHuntYaml, getFieldValue } from '../lib/yaml-parser';

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: tsx scripts/import-yaml.ts <category/file.yml>');
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const rootDir = process.cwd();
  const absolutePath = path.join(rootDir, filePath);
  const content = await fs.readFile(absolutePath, 'utf8');
  const filename = path.basename(filePath);
  const category = filePath.split('/')[0];

  const parsed = parseHuntYaml(content, filename);
  const slug = getFieldValue(content, 'name') || filename.replace(/\.yml$/, '');
  const isFeatured = FEATURED_HUNT_IDS.includes(filePath);

  const pool = new pg.Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });

  try {
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
        isFeatured,
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
          updatedAt: new Date(),
        },
      });

    console.log(`Imported: ${filePath}`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
