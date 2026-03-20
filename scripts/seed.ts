import { promises as fs } from 'node:fs';
import path from 'node:path';

import { drizzle } from 'drizzle-orm/node-postgres';

import { createPool } from '../lib/db/create-pool';
import { PUBLISHED_DIRS } from '../lib/constants';
import { FEATURED_HUNT_IDS } from '../lib/featured';
import { getHuntSlug } from '../lib/hunt-identifiers';
import * as schema from '../lib/db/schema';
import { parseHuntYaml } from '../lib/yaml-parser';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const pool = createPool(databaseUrl);
  const db = drizzle(pool, { schema });
  try {
    const rootDir = process.cwd();
    let total = 0;
    let errors = 0;
    let hasFailures = false;

    for (const category of PUBLISHED_DIRS) {
      const categoryPath = path.join(rootDir, category);

      let files: string[];
      try {
        files = await fs.readdir(categoryPath);
      } catch (error) {
        hasFailures = true;
        errors++;
        console.error(`[seed] Failed to read category directory: ${categoryPath}`, error);
        continue;
      }

      const ymlFiles = files.filter((f) => f.endsWith('.yml')).sort();

      for (const file of ymlFiles) {
        const filePath = `${category}/${file}`;
        try {
          const absolutePath = path.join(categoryPath, file);
          const content = await fs.readFile(absolutePath, 'utf8');
          const parsed = parseHuntYaml(content, file);
          const slug = getHuntSlug(filePath);

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
              isFeatured: FEATURED_HUNT_IDS.includes(filePath),
            })
            .onConflictDoUpdate({
              target: schema.hunts.filePath,
              set: {
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
                isFeatured: FEATURED_HUNT_IDS.includes(filePath),
                updatedAt: new Date(),
              },
            });

          total++;
          console.log(`  [ok] ${filePath}`);
        } catch (err) {
          hasFailures = true;
          errors++;
          console.error(`  [FAIL] ${filePath}:`, err);
        }
      }
    }

    console.log(`\nSeeded ${total} hunts (${errors} errors)`);
    if (hasFailures) {
      throw new Error('Seed completed with one or more filesystem or database errors');
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
