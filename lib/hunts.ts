import * as dbQueries from '@/lib/db/queries';
import { PUBLISHED_DIRS } from '@/lib/constants';
import { normalizePublishedFilePath } from '@/lib/hunt-identifiers';
import {
  getPublishedHuntByIdFromFs,
  getPublishedHuntsFromFs,
  getPublishedHuntSummariesFromFs,
  readPublishedHuntFromFs,
} from '@/lib/hunts-fs';

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

export async function getPublishedHunts(): Promise<HuntRecord[]> {
  try {
    return await dbQueries.getPublishedHunts();
  } catch {
    console.warn('[hunts] Database unavailable, falling back to filesystem');
    return getPublishedHuntsFromFs();
  }
}

export async function getPublishedHuntSummaries(): Promise<HuntSummary[]> {
  try {
    return await dbQueries.getPublishedHuntSummaries();
  } catch {
    console.warn('[hunts] Database unavailable, falling back to filesystem');
    return getPublishedHuntSummariesFromFs();
  }
}

export async function readPublishedHunt(rawPath: string): Promise<string | null> {
  const filePath = normalizePublishedFilePath(rawPath);
  if (!filePath) {
    return null;
  }

  try {
    return await dbQueries.getHuntContent(filePath);
  } catch {
    console.warn('[hunts] Database unavailable, falling back to filesystem');
    return readPublishedHuntFromFs(filePath);
  }
}

export async function getPublishedHuntById(id: string): Promise<HuntRecord | null> {
  try {
    return await dbQueries.getHuntById(id);
  } catch {
    console.warn('[hunts] Database unavailable, falling back to filesystem');
    return getPublishedHuntByIdFromFs(id);
  }
}

export function getHuntDownloadUrl(filePath: string): string {
  return `/api/hunts/file?path=${encodeURIComponent(filePath)}`;
}

export { sanitizePublishedPath } from '@/lib/hunts-fs';
