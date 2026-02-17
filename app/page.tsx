import Image from 'next/image';
import Link from 'next/link';

import HuntCard from '@/components/hunt-card';
import SubmitForm from '@/components/submit-form';
import { FEATURED_HUNT_IDS } from '@/lib/featured';
import { getPublishedHuntSummaries } from '@/lib/hunts';

function formatDate(dateValue: string | undefined) {
  if (!dateValue) {
    return '-';
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export default async function HomePage() {
  const hunts = await getPublishedHuntSummaries();
  const latestUpdated = hunts
    .map((hunt) => hunt.updatedAt)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

  const featuredHunts = FEATURED_HUNT_IDS
    .map((id) => hunts.find((hunt) => hunt.filePath === id))
    .filter((hunt) => hunt != null);

  return (
    <main id="main">
      <section className="hero container">
        <div className="hero-copy">
          <p className="eyebrow">Community QA patterns</p>
          <h1>Find and share reusable hunts for real product flows.</h1>
          <p className="lede">
            Prowl QA Hub publishes only verified templates. Contributors submit hunts through pull
            requests, and templates become visible only after maintainer approval.
          </p>
          <div className="hero-actions">
            <Link href="/browse" className="button button-primary">
              Explore verified hunts
            </Link>
            <a href="#submit" className="button button-ghost">
              Submit through PR
            </a>
          </div>
        </div>

        <aside className="hero-code" aria-label="Example hunt code">
          <div className="code-head">
            <span>oauth-google.yml</span>
            <span className="tag">verified</span>
          </div>
          <pre>
            <code>{`name: oauth-google
steps:
  - navigate: "/login"
  - click: "Sign in with Google"
  - waitForUrl:
      value: "/dashboard"
assertions:
  - urlIncludes: "/dashboard"`}
              </code>
          </pre>
          <p className="code-note">Readable YAML, reusable across projects.</p>
          <Image
            src="/assets/brand/mascot-hero.png"
            alt=""
            width={150}
            height={150}
            className="hero-mascot"
            aria-hidden="true"
          />
        </aside>
      </section>

      <section className="metrics container" aria-label="Catalog statistics">
        <article>
          <p>{hunts.length}</p>
          <span>Verified hunts</span>
        </article>
        <article>
          <p>{new Set(hunts.map((hunt) => hunt.category)).size}</p>
          <span>Categories covered</span>
        </article>
        <article>
          <p>{formatDate(latestUpdated)}</p>
          <span>Last template update</span>
        </article>
      </section>

      <section className="featured container">
        <div className="section-head">
          <div>
            <p className="eyebrow">Featured</p>
            <h2>Curated community hunts</h2>
          </div>
          <p>
            Hand-picked templates spanning auth, e-commerce, admin, and more.
            Each one is verified and ready to drop into your project.
          </p>
        </div>

        <div className="featured-grid">
          {featuredHunts.map((hunt) => (
            <HuntCard key={hunt.id} hunt={hunt} showTags={false} />
          ))}
        </div>

        <div className="featured-cta">
          <Link href="/browse" className="button button-primary">
            Browse all {hunts.length} verified hunts
          </Link>
        </div>
      </section>

      <SubmitForm />

      <section id="quality" className="quality container">
        <article>
          <h3>Verified-only publishing</h3>
          <p>Templates become visible only after PR review and maintainer merge.</p>
        </article>
        <article>
          <h3>Security review</h3>
          <p>Checks flag suspicious URL usage, variable names, and injection patterns.</p>
        </article>
        <article>
          <h3>Structured moderation</h3>
          <p>Submission flow routes contributors through GitHub PRs for controlled approval.</p>
        </article>
      </section>
    </main>
  );
}
