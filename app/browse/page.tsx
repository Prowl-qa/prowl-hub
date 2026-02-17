import type { Metadata } from 'next';
import { Suspense } from 'react';

import BrowseShell from '@/components/browse-shell';
import { getPublishedHuntSummaries } from '@/lib/hunts';

export const metadata: Metadata = {
  title: 'Browse Hunts | Prowl QA Hub',
  description: 'Search, filter, and download verified community hunt templates for Prowl QA.',
};

export default async function BrowsePage() {
  const hunts = await getPublishedHuntSummaries();

  return (
    <section className="browse-page container" aria-label="Browse hunts">
      <div className="section-head">
        <div>
          <p className="eyebrow">Library</p>
          <h2>Browse verified community hunts</h2>
        </div>
        <p>
          Every card below is verified and safe to reuse. Use filters, inspect raw YAML, and
          download directly into your <code>.prowlqa/hunts/</code> directory.
        </p>
      </div>

      <Suspense fallback={<p className="results-count">Loading hunts...</p>}>
        <BrowseShell hunts={hunts} />
      </Suspense>
    </section>
  );
}
