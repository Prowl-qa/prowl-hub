import { eq, and, sql, type SQL } from 'drizzle-orm';

import { getFilePathFromHuntId, getHuntId } from '@/lib/hunt-identifiers';
import type { HuntCategory, HuntSummary, HuntRecord } from '@/lib/hunts';

import { getDb } from './index';
import { hunts, type Hunt } from './schema';

const CATEGORY_LABELS: Record<string, string> = {
  smoke: 'Smoke Tests',
  auth: 'Auth',
  forms: 'Forms',
  admin: 'Admin',
  'e-commerce': 'E-commerce',
  saas: 'SaaS',
  accessibility: 'Accessibility',
  docs: 'Docs',
};

type HuntSummaryRow = Pick<
  Hunt,
  | 'title'
  | 'name'
  | 'description'
  | 'category'
  | 'filePath'
  | 'stepCount'
  | 'assertionCount'
  | 'updatedAt'
  | 'isVerified'
  | 'tags'
>;

const huntSummarySelection = {
  title: hunts.title,
  name: hunts.name,
  description: hunts.description,
  category: hunts.category,
  filePath: hunts.filePath,
  stepCount: hunts.stepCount,
  assertionCount: hunts.assertionCount,
  updatedAt: hunts.updatedAt,
  isVerified: hunts.isVerified,
  tags: hunts.tags,
};

function toSummary(row: HuntSummaryRow): HuntSummary {
  return {
    id: getHuntId(row.filePath),
    title: row.title,
    name: row.name,
    description: row.description,
    category: row.category as HuntCategory,
    categoryLabel: CATEGORY_LABELS[row.category] || row.category,
    filePath: row.filePath,
    stepCount: row.stepCount,
    assertionCount: row.assertionCount,
    updatedAt: row.updatedAt.toISOString(),
    isVerified: row.isVerified,
    isNew: Date.now() - row.updatedAt.getTime() <= 30 * 24 * 60 * 60 * 1000,
    tags: row.tags,
  };
}

function toRecord(row: Hunt): HuntRecord {
  return {
    ...toSummary(row),
    content: row.content,
  };
}

export async function getPublishedHunts(): Promise<HuntRecord[]> {
  const rows = await getDb()
    .select()
    .from(hunts)
    .where(eq(hunts.isVerified, true))
    .orderBy(hunts.title);

  return rows.map(toRecord);
}

export async function getPublishedHuntSummaries(): Promise<HuntSummary[]> {
  const rows = await getDb()
    .select(huntSummarySelection)
    .from(hunts)
    .where(eq(hunts.isVerified, true))
    .orderBy(hunts.title);

  return rows.map(toSummary);
}

export async function getFeaturedHunts(): Promise<HuntSummary[]> {
  const rows = await getDb()
    .select(huntSummarySelection)
    .from(hunts)
    .where(and(eq(hunts.isVerified, true), eq(hunts.isFeatured, true)))
    .orderBy(hunts.title);

  return rows.map(toSummary);
}

export async function getHuntContent(filePath: string): Promise<string | null> {
  const rows = await getDb()
    .select({ content: hunts.content })
    .from(hunts)
    .where(and(eq(hunts.filePath, filePath), eq(hunts.isVerified, true)))
    .limit(1);

  return rows[0]?.content ?? null;
}

export async function getHuntBySlug(slug: string): Promise<HuntRecord | null> {
  const rows = await getDb()
    .select()
    .from(hunts)
    .where(and(eq(hunts.slug, slug), eq(hunts.isVerified, true)))
    .limit(1);

  return rows[0] ? toRecord(rows[0]) : null;
}

export async function getHuntById(id: string): Promise<HuntRecord | null> {
  const filePath = getFilePathFromHuntId(id);
  if (!filePath) {
    return null;
  }

  const rows = await getDb()
    .select()
    .from(hunts)
    .where(and(eq(hunts.filePath, filePath), eq(hunts.isVerified, true)))
    .limit(1);

  return rows[0] ? toRecord(rows[0]) : null;
}

interface SearchOptions {
  q?: string;
  category?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export async function searchHunts(opts: SearchOptions) {
  const conditions: SQL[] = [eq(hunts.isVerified, true)];
  const database = getDb();

  if (opts.category) {
    conditions.push(eq(hunts.category, opts.category));
  }
  if (opts.tags && opts.tags.length > 0) {
    for (const tag of opts.tags) {
      conditions.push(sql`${hunts.tags} @> ${JSON.stringify([tag])}::jsonb`);
    }
  }
  if (opts.q) {
    conditions.push(
      sql`to_tsvector('english', coalesce(${hunts.title}, '') || ' ' || coalesce(${hunts.description}, '') || ' ' || coalesce(${hunts.name}, '')) @@ plainto_tsquery('english', ${opts.q})`
    );
  }

  const where = and(...conditions);
  const limit = opts.limit ?? 20;
  const offset = opts.offset ?? 0;

  const [rows, countResult] = await Promise.all([
    database
      .select(huntSummarySelection)
      .from(hunts)
      .where(where)
      .orderBy(hunts.title)
      .limit(limit)
      .offset(offset),
    database
      .select({ count: sql<number>`count(*)` })
      .from(hunts)
      .where(where),
  ]);

  return {
    total: Number(countResult[0]?.count ?? 0),
    results: rows.map(toSummary),
  };
}

export async function deleteHuntByFilePath(filePath: string): Promise<boolean> {
  const result = await getDb()
    .delete(hunts)
    .where(eq(hunts.filePath, filePath))
    .returning({ id: hunts.id });

  return result.length > 0;
}
