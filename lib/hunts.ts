import { promises as fs } from 'node:fs';
import path from 'node:path';

export const PUBLISHED_DIRS = ['smoke', 'auth', 'forms', 'admin', 'e-commerce', 'saas', 'accessibility', 'docs'] as const;

export type HuntCategory = (typeof PUBLISHED_DIRS)[number];

export interface HuntSummary {
  id: string;
  title: string;
  name: string;
  description: string;
  category: HuntCategory;
  categoryLabel: string;
  filePath: string;
  stepCount: number;
  assertionCount: number;
  updatedAt: string;
  isVerified: boolean;
  isNew: boolean;
  tags: string[];
}

export interface HuntRecord extends HuntSummary {
  content: string;
}

const CATEGORY_LABELS: Record<HuntCategory, string> = {
  smoke: 'Smoke Tests',
  auth: 'Auth',
  forms: 'Forms',
  admin: 'Admin',
  'e-commerce': 'E-commerce',
  saas: 'SaaS',
  accessibility: 'Accessibility',
  docs: 'Docs',
};

const rootDir = process.cwd();
const HUNTS_ROOT = rootDir;
const newThresholdMs = 30 * 24 * 60 * 60 * 1000;
const HUNTS_CACHE_TTL_MS = 30_000;

interface HuntsCache {
  expiresAt: number;
  hunts: HuntRecord[];
  huntById: Map<string, HuntRecord>;
  pending: Promise<HuntRecord[]> | null;
}

const huntsCache: HuntsCache = {
  expiresAt: 0,
  hunts: [],
  huntById: new Map(),
  pending: null,
};

function getFieldValue(content: string, key: string) {
  const match = content.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim() : '';
}

function extractSection(content: string, key: string) {
  const lines = content.split('\n');
  const section: string[] = [];
  let inSection = false;

  for (const line of lines) {
    if (!inSection) {
      if (line.startsWith(`${key}:`)) {
        inSection = true;
      }
      continue;
    }

    if (/^[a-zA-Z0-9_-]+:\s*/.test(line)) {
      break;
    }

    section.push(line);
  }

  return section;
}

function countEntries(lines: string[]) {
  return lines.filter((line) => /^\s*-\s+(?!#).+/.test(line)).length;
}

function getTagValues(content: string): string[] {
  const lines = extractSection(content, 'tags');
  return lines
    .filter((line) => /^\s*-\s+/.test(line))
    .map((line) => line.replace(/^\s*-\s+/, '').trim())
    .filter((tag) => Boolean(tag) && !tag.startsWith('#'));
}

function toDisplayTitle(name: string, fallbackFilename: string) {
  const raw = name || fallbackFilename.replace(/\.yml$/, '');
  return raw.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function getPublishedHuntSummaries(): Promise<HuntSummary[]> {
  const hunts = await getPublishedHunts();
  return hunts.map(({ content: _content, ...summary }) => summary);
}

async function loadPublishedHunts(): Promise<HuntRecord[]> {
  const hunts: HuntRecord[] = [];

  for (const category of PUBLISHED_DIRS) {
    const categoryPath = path.join(HUNTS_ROOT, category);

    let files: string[] = [];
    try {
      files = await fs.readdir(categoryPath);
    } catch {
      continue;
    }

    for (const file of files.filter((entry) => entry.endsWith('.yml')).sort()) {
      const filePath = `${category}/${file}`;
      try {
        const absolutePath = path.join(HUNTS_ROOT, category, file);
        const content = await fs.readFile(absolutePath, 'utf8');
        const stats = await fs.stat(absolutePath);

        const name = getFieldValue(content, 'name');
        const description = getFieldValue(content, 'description');
        const stepCount = countEntries(extractSection(content, 'steps'));
        const assertionCount = countEntries(extractSection(content, 'assertions'));
        const tags = getTagValues(content);
        const isNew = Date.now() - stats.mtimeMs <= newThresholdMs;

        hunts.push({
          id: filePath.replace(/[/.]/g, '-'),
          title: toDisplayTitle(name, file),
          name,
          description,
          category,
          categoryLabel: CATEGORY_LABELS[category],
          filePath,
          stepCount,
          assertionCount,
          updatedAt: stats.mtime.toISOString(),
          isVerified: true,
          isNew,
          tags,
          content,
        });
      } catch (error) {
        console.warn(`[hunts] Skipping unreadable template "${filePath}"`, error);
      }
    }
  }

  return hunts
    .filter((hunt) => hunt.isVerified)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function getPublishedHunts(): Promise<HuntRecord[]> {
  const now = Date.now();
  if (huntsCache.expiresAt > now) {
    return huntsCache.hunts;
  }

  if (huntsCache.pending) {
    return huntsCache.pending;
  }

  huntsCache.pending = loadPublishedHunts()
    .then((hunts) => {
      huntsCache.hunts = hunts;
      huntsCache.huntById = new Map(hunts.map((hunt) => [hunt.id, hunt]));
      huntsCache.expiresAt = Date.now() + HUNTS_CACHE_TTL_MS;
      huntsCache.pending = null;
      return hunts;
    })
    .catch((error) => {
      huntsCache.pending = null;
      throw error;
    });

  return huntsCache.pending;
}

export async function getPublishedHuntById(id: string): Promise<HuntRecord | null> {
  const now = Date.now();
  if (huntsCache.expiresAt > now) {
    return huntsCache.huntById.get(id) ?? null;
  }

  await getPublishedHunts();
  return huntsCache.huntById.get(id) ?? null;
}

export function getHuntDownloadUrl(filePath: string): string {
  return `/api/hunts/file?path=${encodeURIComponent(filePath)}`;
}

export function sanitizePublishedPath(rawPath: string): string | null {
  const normalized = path
    .normalize(rawPath)
    .replace(/^([.][.][/\\])+/, '')
    .replace(/^[/\\]+/, '');

  const rawSegments = normalized.split(/[\\/]+/).filter(Boolean);
  const segments =
    rawSegments[0] === '.prowlqa' && rawSegments[1] === 'hunts' ? rawSegments.slice(2) : rawSegments;

  if (segments.length < 2) {
    return null;
  }

  const [category, ...rest] = segments;
  if (!PUBLISHED_DIRS.includes(category as HuntCategory)) {
    return null;
  }

  const resolved = path.resolve(HUNTS_ROOT, path.join(category, ...rest));
  const allowedPrefix = path.join(HUNTS_ROOT, category, path.sep);

  if (!resolved.startsWith(allowedPrefix) || path.extname(resolved) !== '.yml') {
    return null;
  }

  return resolved;
}

export async function readPublishedHunt(rawPath: string): Promise<string | null> {
  const safePath = sanitizePublishedPath(rawPath);
  if (!safePath) {
    return null;
  }

  try {
    return await fs.readFile(safePath, 'utf8');
  } catch {
    return null;
  }
}
