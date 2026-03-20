import { PUBLISHED_DIRS } from './constants';

export function getHuntId(filePath: string): string {
  return filePath.replace(/[/.]/g, '-');
}

export function getFilePathFromHuntId(id: string): string | null {
  if (!id.endsWith('-yml')) {
    return null;
  }

  for (const category of PUBLISHED_DIRS) {
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

export function getCategoryScopedSlug(
  category: string,
  name: string,
  fallbackFilename: string
): string {
  const baseSlug = name || fallbackFilename.replace(/\.yml$/, '');
  return `${category}-${baseSlug}`;
}
