import path from 'node:path';

import { NextResponse } from 'next/server';

import { readPublishedHunt } from '@/lib/hunts';

function sanitizeDownloadFilename(rawPath: string): string {
  const fallback = 'download.yaml';
  const base = path.basename(rawPath);
  const sanitized = base
    .replace(/[\r\n]/g, '')
    .replace(/["']/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/[\\/]/g, '')
    .trim();

  if (!sanitized || sanitized.length > 120) {
    return fallback;
  }

  return sanitized;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('path');

  if (!filePath) {
    return new NextResponse('Missing hunt path', { status: 400 });
  }

  const content = await readPublishedHunt(filePath);
  if (!content) {
    return new NextResponse('Hunt not found', { status: 404 });
  }

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'application/x-yaml; charset=utf-8',
      'Content-Disposition': `attachment; filename="${sanitizeDownloadFilename(filePath)}"`,
      'Cache-Control': 'no-store',
    },
  });
}
