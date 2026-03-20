import { promises as fs } from 'node:fs';
import path from 'node:path';

import { PUBLISHED_DIRS } from '@/lib/constants';
import { getFilePathFromHuntId, getHuntId, normalizePublishedFilePath } from '@/lib/hunt-identifiers';
import type { HuntCategory, HuntSummary, HuntRecord } from '@/lib/hunts';
import {
  countAssertions,
  countSteps,
  getFieldValue,
  getTagValues,
  toDisplayTitle,
} from '@/lib/yaml-parser';

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
        const hunt = await readPublishedHuntRecordFromFs(filePath);
        if (hunt) {
          hunts.push(hunt);
        }
      } catch (error) {
        console.warn(`[hunts] Skipping unreadable template "${filePath}"`, error);
      }
    }
  }

  return hunts.sort((a, b) => a.title.localeCompare(b.title));
}

export async function getPublishedHuntSummariesFromFs(): Promise<HuntSummary[]> {
  const hunts = await getPublishedHuntsFromFs();
  return hunts.map(({ content: _content, ...summary }) => summary);
}

export async function getPublishedHuntByIdFromFs(id: string): Promise<HuntRecord | null> {
  const filePath = getFilePathFromHuntId(id);
  if (!filePath) {
    return null;
  }

  return readPublishedHuntRecordFromFs(filePath);
}

function isPathWithin(parent: string, child: string): boolean {
  const relative = path.relative(parent, child);
  return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

export function sanitizePublishedPath(rawPath: string): string | null {
  const normalizedPath = normalizePublishedFilePath(path.normalize(rawPath));
  if (!normalizedPath) return null;

  const [category, ...rest] = normalizedPath.split('/');
  const resolved = path.resolve(HUNTS_ROOT, path.join(category, ...rest));
  const allowedPrefix = path.join(HUNTS_ROOT, category) + path.sep;
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

async function readPublishedHuntRecordFromFs(filePath: string): Promise<HuntRecord | null> {
  const safePath = sanitizePublishedPath(filePath);
  if (!safePath) {
    return null;
  }

  try {
    const category = filePath.split('/')[0] as HuntCategory;
    const content = await fs.readFile(safePath, 'utf8');
    const stats = await fs.stat(safePath);
    const filename = path.basename(filePath);
    const name = getFieldValue(content, 'name');

    return {
      id: getHuntId(filePath),
      title: toDisplayTitle(name, filename),
      name,
      description: getFieldValue(content, 'description'),
      category,
      categoryLabel: CATEGORY_LABELS[category],
      filePath,
      stepCount: countSteps(content),
      assertionCount: countAssertions(content),
      updatedAt: stats.mtime.toISOString(),
      isVerified: true,
      isNew: Date.now() - stats.mtimeMs <= newThresholdMs,
      tags: getTagValues(content),
      content,
    };
  } catch {
    return null;
  }
}
