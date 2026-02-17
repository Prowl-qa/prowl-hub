'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

import type { HuntRecord } from '@/lib/hunts';

interface HubShellProps {
  hunts: HuntRecord[];
}

const GITHUB_NEW_FILE_URL = 'https://github.com/Prowl-qa/prowl-hub/new/main';

type SubmitState = {
  kind: 'success' | 'error';
  message: string;
} | null;

function toDisplayDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function HubShell({ hunts }: HubShellProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | HuntRecord['category']>('all');
  const [selectedHunt, setSelectedHunt] = useState<HuntRecord | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>(null);
  const [copyState, setCopyState] = useState<'idle' | 'done' | 'failed'>('idle');

  useEffect(() => {
    setCopyState('idle');
  }, [selectedHunt]);

  const categories = useMemo(
    () => [
      { key: 'all', label: 'All' },
      ...Array.from(new Set(hunts.map((hunt) => hunt.category))).map((key) => ({
        key,
        label: hunts.find((hunt) => hunt.category === key)?.categoryLabel ?? key,
      })),
    ],
    [hunts]
  );

  const filteredHunts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return hunts.filter((hunt) => {
      if (!hunt.isVerified) {
        return false;
      }

      const categoryMatch = category === 'all' || hunt.category === category;
      const queryMatch =
        normalizedQuery.length === 0 ||
        `${hunt.title} ${hunt.description} ${hunt.categoryLabel} ${hunt.tags.join(' ')}`.toLowerCase().includes(normalizedQuery);

      return categoryMatch && queryMatch;
    });
  }, [hunts, query, category]);

  async function handleCopy() {
    if (!selectedHunt) {
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedHunt.content);
      setCopyState('done');
    } catch {
      setCopyState('failed');
    }

    window.setTimeout(() => {
      setCopyState('idle');
    }, 1400);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      setSubmitState({
        kind: 'error',
        message: 'Complete all required fields before opening a pull request.',
      });
      return;
    }

    const formData = new FormData(form);
    const huntName = String(formData.get('name') ?? '');
    const huntDescription = String(formData.get('description') ?? '');
    const huntCategory = String(formData.get('category') ?? '');
    const huntYaml = String(formData.get('yaml') ?? '');

    const huntSlug = slugify(huntName);
    if (!huntSlug) {
      setSubmitState({ kind: 'error', message: 'Hunt name must include letters or numbers.' });
      return;
    }

    const validatedCategory = huntCategory.trim();
    if (!/^[a-zA-Z0-9_-]+$/.test(validatedCategory)) {
      setSubmitState({
        kind: 'error',
        message: 'Invalid category; use only letters, numbers, hyphen or underscore.',
      });
      return;
    }

    const suggestedFilePath = `.prowlqa/hunts/${validatedCategory}/${huntSlug}.yml`;
    const commitMessage = `feat(hunt): add ${huntSlug} template`;

    const params = new URLSearchParams({
      filename: suggestedFilePath,
      value: huntYaml,
      message: commitMessage,
      description: `Add verified community hunt template: ${huntDescription}`,
    });

    window.open(`${GITHUB_NEW_FILE_URL}?${params.toString()}`, '_blank', 'noopener,noreferrer');

    setSubmitState({
      kind: 'success',
      message:
        'GitHub opened. Commit this file on a branch and create a PR. It will appear in Hub only after approval and merge.',
    });
    form.reset();
  }

  return (
    <>
      <section id="browse" className="browse container">
        <div className="section-head">
          <div>
            <p className="eyebrow">Library</p>
            <h2>Browse verified community hunts</h2>
          </div>
          <p>
            Every card below is verified and safe to reuse. Use filters, inspect raw YAML, and
            download directly into your `.prowlqa/hunts/` directory.
          </p>
        </div>

        <div className="controls" role="region" aria-label="Hunt filters">
          <label className="search-field" htmlFor="search-input">
            <span>Search hunts</span>
            <input
              id="search-input"
              type="search"
              placeholder="Try OAuth, checkout, invite..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <div className="chip-row" role="list" aria-label="Categories">
            {categories.map((entry) => (
              <button
                key={entry.key}
                type="button"
                className={category === entry.key ? 'is-active' : ''}
                onClick={() => setCategory(entry.key as 'all' | HuntRecord['category'])}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hunt-grid" aria-live="polite">
          {filteredHunts.length === 0 ? (
            <div className="empty-state">No verified hunts match that filter yet.</div>
          ) : (
            filteredHunts.map((hunt) => (
              <article key={hunt.id} className="hunt-card">
                <h3>{hunt.title}</h3>
                <p>{hunt.description || 'Reusable hunt template.'}</p>

                <div className="meta-row">
                  <span className="meta-pill">{hunt.categoryLabel}</span>
                  <span className="meta-pill meta-pill-verified">Verified</span>
                  {hunt.isNew && <span className="meta-pill meta-pill-new">New</span>}
                </div>

                <div className="meta-row">
                  <span className="meta-pill">{hunt.stepCount} steps</span>
                  <span className="meta-pill">{hunt.assertionCount} assertions</span>
                  <span className="meta-pill">Updated {toDisplayDate(hunt.updatedAt)}</span>
                </div>

                {hunt.tags.length > 0 && (
                  <div className="meta-row">
                    {hunt.tags.map((tag) => (
                      <span key={tag} className="meta-pill meta-pill-tag">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="hunt-actions">
                  <button type="button" className="button button-ghost" onClick={() => setSelectedHunt(hunt)}>
                    Preview YAML
                  </button>
                  <a
                    className="button button-primary"
                    href={`/api/hunts/file?path=${encodeURIComponent(hunt.filePath)}`}
                    download={hunt.filePath.split('/').pop() || 'hunt.yml'}
                  >
                    Download
                  </a>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section id="submit" className="submit container">
        <div className="section-head">
          <div>
            <p className="eyebrow">Contribute</p>
            <h2>Submit a hunt through pull request</h2>
          </div>
          <p>
            Submission opens GitHub with a prefilled hunt file. Only merged PRs are published,
            which keeps the live catalog verified-only.
          </p>
        </div>

        <form className="submit-form" onSubmit={handleSubmit} noValidate>
          <label>
            Hunt name
            <input name="name" required placeholder="ex: multi-step-onboarding" />
          </label>

          <label>
            Category
            <select name="category" required>
              <option value="">Select category</option>
              <option value="auth">Auth</option>
              <option value="e-commerce">E-commerce</option>
              <option value="admin">Admin</option>
              <option value="saas">SaaS</option>
              <option value="accessibility">Accessibility</option>
            </select>
          </label>

          <label>
            Short description
            <input name="description" required placeholder="What does this hunt validate?" />
          </label>

          <label>
            Hunt YAML
            <textarea
              name="yaml"
              rows={10}
              required
              placeholder="Paste your hunt YAML here..."
            ></textarea>
          </label>

          <fieldset>
            <legend>Required before PR</legend>
            <label>
              <input type="checkbox" required /> Uses generic selectors
            </label>
            <label>
              <input type="checkbox" required /> Contains no secrets or credentials
            </label>
            <label>
              <input type="checkbox" required /> Includes comments and customization notes
            </label>
          </fieldset>

          <button className="button button-primary" type="submit">
            Open Pull Request Flow
          </button>

          <p className={`submit-message ${submitState?.kind === 'error' ? 'is-error' : ''}`} aria-live="polite">
            {submitState?.message ?? ''}
          </p>
        </form>
      </section>

      {selectedHunt && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedHunt(null)}>
          <div
            className="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <h3 id="preview-title">{selectedHunt.title}</h3>
              <button type="button" className="icon-button" onClick={() => setSelectedHunt(null)}>
                Close
              </button>
            </div>

            <p className="dialog-meta">
              {selectedHunt.categoryLabel} | Verified | {selectedHunt.stepCount} steps | Updated{' '}
              {toDisplayDate(selectedHunt.updatedAt)}
            </p>

            <pre>
              <code>{selectedHunt.content}</code>
            </pre>

            <div className="dialog-actions">
              <button type="button" className="button button-ghost" onClick={handleCopy}>
                {copyState === 'done' && 'Copied'}
                {copyState === 'failed' && 'Copy failed'}
                {copyState === 'idle' && 'Copy YAML'}
              </button>
              <a
                className="button button-primary"
                href={`/api/hunts/file?path=${encodeURIComponent(selectedHunt.filePath)}`}
                download={selectedHunt.filePath.split('/').pop() || 'hunt.yml'}
              >
                Download file
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
