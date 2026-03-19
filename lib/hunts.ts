export const PUBLISHED_DIRS = ['smoke', 'auth', 'forms', 'admin', 'e-commerce', 'saas', 'accessibility'] as const;

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

import * as dbQueries from '@/lib/db/queries';
import {
  getPublishedHuntsFromFs,
  getPublishedHuntSummariesFromFs,
  readPublishedHuntFromFs,
} from '@/lib/hunts-fs';

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
  try {
    return await dbQueries.getHuntContent(rawPath);
  } catch {
    console.warn('[hunts] Database unavailable, falling back to filesystem');
    return readPublishedHuntFromFs(rawPath);
  }
}

export { sanitizePublishedPath } from '@/lib/hunts-fs';
