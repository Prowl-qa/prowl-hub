interface DownloadEvent {
  huntPath: string;
  category: string;
  huntName: string;
  userAgent?: string;
  referer?: string;
  country?: string;
}

/**
 * Download tracking POST to the Beelink API. No-ops silently if
 * TRACKING_API_URL is not set (local dev). Never throws.
 *
 * Returns a promise that settles once the POST completes. Call it via
 * Next's `after()` so Vercel keeps the serverless function alive until the
 * request lands — awaiting it inline would block the response, while plain
 * fire-and-forget gets dropped when the function context is torn down.
 */
export async function trackDownload(event: DownloadEvent): Promise<void> {
  const url = process.env.TRACKING_API_URL;
  if (!url) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      signal: controller.signal,
    });
  } catch {
    // Tracking is best-effort; never surface failures to the caller.
  } finally {
    clearTimeout(timeout);
  }
}
