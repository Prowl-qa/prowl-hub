import path from 'node:path';

import { NextResponse } from 'next/server';

import { readPublishedHunt } from '@/lib/hunts';
import { trackDownload } from '@/lib/tracking';

function sanitizeDownloadFilename(rawPath: string): string {
  const fallback = 'download.yaml';
  const base = path.basename(rawPath);
  const sanitized = Array.from(
    base
    .replace(/[\r\n]/g, '')
    .replace(/["']/g, '')
    .replace(/[\\/]/g, '')
  )
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code > 31 && code !== 127;
    })
    .join('')
    .trim();

  if (!sanitized || sanitized.length > 120) {
    return fallback;
  }

  return sanitized;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('path');
  const isPreview = searchParams.get('preview') === '1';

  if (!filePath) {
    return new NextResponse('Missing hunt path', { status: 400 });
  }

  const content = await readPublishedHunt(filePath);
  if (!content) {
    return new NextResponse('Hunt not found', { status: 404 });
  }

  if (!isPreview) {
    const segments = filePath.split('/');
    const category = segments[0] || '';
    const huntName = (segments[segments.length - 1] || '').replace(/\.yml$/, '');

    trackDownload({
      huntPath: filePath,
      category,
      huntName,
      userAgent: request.headers.get('user-agent') ?? undefined,
      referer: request.headers.get('referer') ?? undefined,
      country: request.headers.get('cf-ipcountry') ?? undefined,
    });
  }

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'application/x-yaml; charset=utf-8',
      'Content-Disposition': `attachment; filename="${sanitizeDownloadFilename(filePath)}"`,
      'Cache-Control': 'no-store',
    },
  });
}
