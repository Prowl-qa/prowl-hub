import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import HuntCard from '@/components/hunt-card';
import { toDisplayDate } from '@/lib/format';
import { getPublishedHunts, type HuntRecord, type HuntSummary } from '@/lib/hunts';

interface PageParams {
  params: Promise<{ category: string; name: string }>;
}

const RELATED_LIMIT = 6;

async function findHunt(category: string, name: string): Promise<{
  hunt: HuntRecord;
  related: HuntSummary[];
} | null> {
  const all = await getPublishedHunts();
  const filePath = `${category}/${name}.yml`;
  const hunt = all.find((h) => h.category === category && h.filePath === filePath);
  if (!hunt) {
    return null;
  }
  const related = all
    .filter((h) => h.category === category && h.id !== hunt.id)
    .slice(0, RELATED_LIMIT);
  return { hunt, related };
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { category, name } = await params;
  const match = await findHunt(category, name);
  if (!match) {
    return { title: 'Hunt not found | Prowl QA Hub' };
  }
  return {
    title: `${match.hunt.title} | Prowl QA Hub`,
    description: match.hunt.description || `Verified ${match.hunt.categoryLabel} hunt template for Prowl QA.`,
  };
}

export default async function HuntDetailPage({ params }: PageParams) {
  const { category, name } = await params;
  const match = await findHunt(category, name);
  if (!match) {
    notFound();
  }

  const { hunt, related } = match;
  const tags = (hunt.tags || []).filter((tag) => tag.trim().length > 0 && !tag.trim().startsWith('#'));
  const downloadHref = `/api/hunts/file?path=${encodeURIComponent(hunt.filePath)}`;
  const downloadName = hunt.filePath.split('/').pop() || 'hunt.yml';

  return (
    <section className="hunt-detail container" aria-label={`${hunt.title} hunt details`}>
      <nav className="hunt-detail-crumbs" aria-label="Breadcrumb">
        <Link href="/browse">Browse</Link>
        <span aria-hidden="true"> / </span>
        <Link href={`/browse?category=${encodeURIComponent(hunt.category)}`}>
          {hunt.categoryLabel}
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{hunt.title}</span>
      </nav>

      <header className="hunt-detail-head">
        <p className="eyebrow">{hunt.categoryLabel}</p>
        <h1>{hunt.title}</h1>
        <p className="hunt-detail-description">
          {hunt.description || 'Reusable hunt template.'}
        </p>

        <div className="meta-row">
          {hunt.isVerified && <span className="verified-badge">Verified</span>}
          {hunt.isNew && <span className="meta-pill meta-pill-new">New</span>}
          <span className="meta-pill">{hunt.stepCount} steps</span>
          <span className="meta-pill">{hunt.assertionCount} assertions</span>
          <span className="meta-pill">Updated {toDisplayDate(hunt.updatedAt)}</span>
        </div>

        {tags.length > 0 && (
          <div className="meta-row">
            {tags.map((tag) => (
              <span key={tag} className="meta-pill meta-pill-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="hunt-actions">
          <a className="button button-primary" href={downloadHref} download={downloadName}>
            Download YAML
          </a>
          <Link className="button button-ghost" href="/browse">
            Back to browse
          </Link>
        </div>
      </header>

      <article className="hunt-detail-yaml" aria-label="Hunt YAML">
        <header className="hunt-detail-yaml-head">
          <h2>Full hunt definition</h2>
          <code>{hunt.filePath}</code>
        </header>
        <pre>
          <code>{hunt.content}</code>
        </pre>
      </article>

      {related.length > 0 && (
        <section className="related-hunts" aria-labelledby="related-heading">
          <div className="section-head">
            <div>
              <p className="eyebrow">Related</p>
              <h2 id="related-heading">More {hunt.categoryLabel} hunts</h2>
            </div>
          </div>
          <div className="hunt-grid">
            {related.map((entry) => (
              <HuntCard key={entry.id} hunt={entry} />
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
