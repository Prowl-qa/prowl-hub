import Image from 'next/image';

import HubShell from '@/components/hub-shell';
import { getPublishedHunts } from '@/lib/hunts';

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
  const hunts = await getPublishedHunts();
  const latestUpdated = hunts
    .map((hunt) => hunt.updatedAt)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header">
        <div className="container nav-shell">
          <a href="/" className="brand" aria-label="Prowl Hub home">
            <Image src="/assets/brand/mascot.png" alt="" width={34} height={34} />
            <span>Prowl QA Hub</span>
          </a>

          <nav className="primary-nav" aria-label="Primary">
            <a href="#browse">Browse hunts</a>
            <a href="#submit">Submit hunt</a>
            <a href="#quality">Quality and safety</a>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="hero container">
          <div className="hero-copy">
            <p className="eyebrow">Community QA patterns</p>
            <h1>Find and share reusable hunts for real product flows.</h1>
            <p className="lede">
              Prowl Hub publishes only verified templates. Contributors submit hunts through pull
              requests, and templates become visible only after maintainer approval.
            </p>
            <div className="hero-actions">
              <a href="#browse" className="button button-primary">
                Explore verified hunts
              </a>
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
  - urlIncludes: "/dashboard"`}</code>
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

        <HubShell hunts={hunts} />

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

      <footer className="site-footer">
        <div className="container">
          <p>Prototype community interface for Prowl Hub.</p>
          <p>Only verified hunts are listed in this catalog.</p>
        </div>
      </footer>
    </>
  );
}
