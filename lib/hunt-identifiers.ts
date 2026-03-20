import path from 'node:path';

import { PUBLISHED_DIRS } from './constants';

const SORTED_PUBLISHED_DIRS = [...PUBLISHED_DIRS].sort((a, b) => b.length - a.length);

export function getHuntId(filePath: string): string {
  return filePath.replace(/[/.]/g, '-');
}

export function getHuntSlug(filePath: string): string {
  return getHuntId(filePath).replace(/-yml$/, '');
}

export function getFilePathFromHuntId(id: string): string | null {
  if (!id.endsWith('-yml')) {
    return null;
  }

  for (const category of SORTED_PUBLISHED_DIRS) {
    const prefix = `${category}-`;
    if (id.startsWith(prefix)) {
      const basename = id.slice(prefix.length, -'-yml'.length);
      if (!basename) {
        return null;
      }
      return `${category}/${basename}.yml`;
    }
  }

  return null;
}

export function normalizePublishedFilePath(rawPath: string): string | null {
  const normalized = path.posix
    .normalize(rawPath.replace(/\\/g, '/'))
    .replace(/^([.][.]\/)+/, '')
    .replace(/^\/+/, '');

  const rawSegments = normalized.split('/').filter(Boolean);
  const segments =
    rawSegments[0] === '.prowlqa' && rawSegments[1] === 'hunts' ? rawSegments.slice(2) : rawSegments;

  if (segments.length < 2) {
    return null;
  }

  const [category, ...rest] = segments;
  if (!PUBLISHED_DIRS.includes(category as (typeof PUBLISHED_DIRS)[number])) {
    return null;
  }

  const publishedPath = `${category}/${rest.join('/')}`;
  return publishedPath.endsWith('.yml') ? publishedPath : null;
}
