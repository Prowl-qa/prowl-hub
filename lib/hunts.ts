import { promises as fs } from 'node:fs';
import path from 'node:path';

export const PUBLISHED_DIRS = ['auth', 'admin', 'e-commerce', 'saas', 'accessibility'] as const;

export type HuntCategory = (typeof PUBLISHED_DIRS)[number];

export interface HuntRecord {
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
  content: string;
}

const CATEGORY_LABELS: Record<HuntCategory, string> = {
  auth: 'Auth',
  admin: 'Admin',
  'e-commerce': 'E-commerce',
  saas: 'SaaS',
  accessibility: 'Accessibility',
};

const rootDir = process.cwd();
const HUNTS_ROOT = path.join(rootDir, '.prowlqa', 'hunts');
const newThresholdMs = 30 * 24 * 60 * 60 * 1000;

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

function toDisplayTitle(name: string, fallbackFilename: string) {
  const raw = name || fallbackFilename.replace(/\.yml$/, '');
  return raw.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function getPublishedHunts(): Promise<HuntRecord[]> {
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
      const filePath = `.prowlqa/hunts/${category}/${file}`;
      try {
        const absolutePath = path.join(HUNTS_ROOT, category, file);
        const content = await fs.readFile(absolutePath, 'utf8');
        const stats = await fs.stat(absolutePath);

        const name = getFieldValue(content, 'name');
        const description = getFieldValue(content, 'description');
        const stepCount = countEntries(extractSection(content, 'steps'));
        const assertionCount = countEntries(extractSection(content, 'assertions'));
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
