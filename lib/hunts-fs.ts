import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { HuntCategory, HuntSummary, HuntRecord } from '@/lib/hunts';

const PUBLISHED_DIRS = ['smoke', 'auth', 'forms', 'admin', 'e-commerce', 'saas', 'accessibility'] as const;

const CATEGORY_LABELS: Record<HuntCategory, string> = {
  smoke: 'Smoke Tests',
  auth: 'Auth',
  forms: 'Forms',
  admin: 'Admin',
  'e-commerce': 'E-commerce',
  saas: 'SaaS',
  accessibility: 'Accessibility',
};

const rootDir = process.cwd();
const HUNTS_ROOT = rootDir;
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
      if (line.startsWith(`${key}:`)) inSection = true;
      continue;
    }
    if (/^[a-zA-Z0-9_-]+:\s*/.test(line)) break;
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

export async function getPublishedHuntsFromFs(): Promise<HuntRecord[]> {
  const hunts: HuntRecord[] = [];

  for (const category of PUBLISHED_DIRS) {
    const categoryPath = path.join(HUNTS_ROOT, category);
    let files: string[] = [];
    try {
      files = await fs.readdir(categoryPath);
    } catch {
      continue;
    }

    for (const file of files.filter((e) => e.endsWith('.yml')).sort()) {
      const filePath = `${category}/${file}`;
      try {
        const absolutePath = path.join(HUNTS_ROOT, category, file);
        const content = await fs.readFile(absolutePath, 'utf8');
        const stats = await fs.stat(absolutePath);
        const name = getFieldValue(content, 'name');

        hunts.push({
          id: filePath.replace(/[/.]/g, '-'),
          title: toDisplayTitle(name, file),
          name,
          description: getFieldValue(content, 'description'),
          category,
          categoryLabel: CATEGORY_LABELS[category],
          filePath,
          stepCount: countEntries(extractSection(content, 'steps')),
          assertionCount: countEntries(extractSection(content, 'assertions')),
          updatedAt: stats.mtime.toISOString(),
          isVerified: true,
          isNew: Date.now() - stats.mtimeMs <= newThresholdMs,
          tags: getTagValues(content),
          content,
        });
      } catch (error) {
        console.warn(`[hunts] Skipping unreadable template "${filePath}"`, error);
      }
    }
  }

  return hunts
    .filter((h) => h.isVerified)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function getPublishedHuntSummariesFromFs(): Promise<HuntSummary[]> {
  const hunts = await getPublishedHuntsFromFs();
  return hunts.map(({ content: _content, ...summary }) => summary);
}

function isPathWithin(parent: string, child: string): boolean {
  const relative = path.relative(parent, child);
  return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

export function sanitizePublishedPath(rawPath: string): string | null {
  const normalized = path
    .normalize(rawPath)
    .replace(/^([.][.][/\\])+/, '')
    .replace(/^[/\\]+/, '');

  const rawSegments = normalized.split(/[\\/]+/).filter(Boolean);
  const segments =
    rawSegments[0] === '.prowlqa' && rawSegments[1] === 'hunts' ? rawSegments.slice(2) : rawSegments;

  if (segments.length < 2) return null;

  const [category, ...rest] = segments;
  if (!PUBLISHED_DIRS.includes(category as HuntCategory)) return null;

  const resolved = path.resolve(HUNTS_ROOT, path.join(category, ...rest));
  const allowedPrefix = path.join(HUNTS_ROOT, category, path.sep);
  if (!resolved.startsWith(allowedPrefix) || path.extname(resolved) !== '.yml') return null;

  return resolved;
}

export async function readPublishedHuntFromFs(rawPath: string): Promise<string | null> {
  const safePath = sanitizePublishedPath(rawPath);
  if (!safePath) return null;

  try {
    const category = path.relative(HUNTS_ROOT, safePath).split(path.sep)[0];
    const [realPath, realCategoryRoot] = await Promise.all([
      fs.realpath(safePath),
      fs.realpath(path.join(HUNTS_ROOT, category)),
    ]);
    if (path.extname(realPath) !== '.yml' || !isPathWithin(realCategoryRoot, realPath)) return null;
    return await fs.readFile(realPath, 'utf8');
  } catch {
    return null;
  }
}
