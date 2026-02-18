'use client';

import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import HuntCard from '@/components/hunt-card';
import { toDisplayDate } from '@/lib/format';
import type { HuntSummary } from '@/lib/hunts';

const ITEMS_PER_PAGE = 12;

interface BrowseShellProps {
  hunts: HuntSummary[];
}

function buildPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];

  if (current > 3) {
    pages.push('ellipsis');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('ellipsis');
  }

  pages.push(total);
  return pages;
}

export default function BrowseShell({ hunts }: BrowseShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get('category') || 'all';
  const currentPage = Math.max(1, Number(searchParams.get('page')) || 1);

  const [query, setQuery] = useState('');
  const [selectedHunt, setSelectedHunt] = useState<HuntSummary | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'done' | 'failed'>('idle');
  const modalPanelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const previewRequestIdRef = useRef(0);

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
      const categoryMatch = category === 'all' || hunt.category === category;
      const tags = (hunt.tags || []).filter((tag) => tag.trim().length > 0 && !tag.trim().startsWith('#'));
      const queryMatch =
        normalizedQuery.length === 0 ||
        `${hunt.title} ${hunt.description} ${hunt.categoryLabel} ${tags.join(' ')}`.toLowerCase().includes(normalizedQuery);

      return categoryMatch && queryMatch;
    });
  }, [hunts, query, category]);

  const totalPages = Math.max(1, Math.ceil(filteredHunts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedHunts = filteredHunts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const pageNumbers = buildPageNumbers(safePage, totalPages);

  const updateUrl = useCallback(
    (page: number, cat: string) => {
      const params = new URLSearchParams();
      if (cat !== 'all') params.set('category', cat);
      if (page > 1) params.set('page', String(page));
      const qs = params.toString();
      router.replace(`/browse${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [router]
  );

  const closePreview = useCallback(() => {
    previewRequestIdRef.current += 1;
    setSelectedHunt(null);
    setPreviewContent(null);
    setCopyState('idle');
  }, []);

  function handleCategoryChange(newCategory: string) {
    startTransition(() => {
      updateUrl(1, newCategory);
    });
  }

  function handlePageChange(page: number) {
    startTransition(() => {
      updateUrl(page, category);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSearchChange(value: string) {
    setQuery(value);
  }

  async function handlePreview(hunt: HuntSummary) {
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      triggerRef.current = activeElement;
    }

    const requestId = ++previewRequestIdRef.current;
    setSelectedHunt(hunt);
    setPreviewContent(null);
    setCopyState('idle');

    try {
      const response = await fetch(`/api/hunts/file?path=${encodeURIComponent(hunt.filePath)}&preview=1`);
      if (requestId !== previewRequestIdRef.current) {
        return;
      }
      if (response.ok) {
        setPreviewContent(await response.text());
      } else {
        setPreviewContent('# Failed to load hunt content');
      }
    } catch {
      if (requestId !== previewRequestIdRef.current) {
        return;
      }
      setPreviewContent('# Failed to load hunt content');
    }
  }

  async function handleCopy() {
    if (!previewContent) return;

    try {
      await navigator.clipboard.writeText(previewContent);
      setCopyState('done');
    } catch {
      setCopyState('failed');
    }

    window.setTimeout(() => {
      setCopyState('idle');
    }, 1400);
  }

  useEffect(() => {
    if (!selectedHunt) {
      if (triggerRef.current) {
        triggerRef.current.focus();
        triggerRef.current = null;
      }
      return;
    }

    const dialog = modalPanelRef.current;
    if (!dialog) {
      return;
    }
    const dialogElement: HTMLDivElement = dialog;

    const initialFocus = closeButtonRef.current ?? dialogElement;
    initialFocus.focus();

    const getFocusableElements = () =>
      Array.from(
        dialogElement.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => element.getAttribute('aria-hidden') !== 'true');

    function handleDialogKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closePreview();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        dialogElement.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!activeElement || !dialogElement.contains(activeElement) || activeElement === first) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (!activeElement || !dialogElement.contains(activeElement) || activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    dialogElement.addEventListener('keydown', handleDialogKeydown);
    return () => dialogElement.removeEventListener('keydown', handleDialogKeydown);
  }, [closePreview, selectedHunt]);

  return (
    <>
      <div className="controls" role="region" aria-label="Hunt filters">
        <label className="search-field" htmlFor="browse-search">
          <span>Search hunts</span>
          <input
            id="browse-search"
            type="search"
            placeholder="Try OAuth, checkout, invite..."
            value={query}
            onChange={(event) => handleSearchChange(event.target.value)}
          />
        </label>

        <div className="chip-row" role="list" aria-label="Categories">
          {categories.map((entry) => (
            <div key={entry.key} role="listitem">
              <button
                type="button"
                className={category === entry.key ? 'is-active' : ''}
                onClick={() => handleCategoryChange(entry.key)}
              >
                {entry.label}
              </button>
            </div>
          ))}
        </div>
      </div>

      <p className="results-count" aria-live="polite">
        Showing {paginatedHunts.length} of {filteredHunts.length} hunt{filteredHunts.length !== 1 ? 's' : ''}
      </p>

      <div className="hunt-grid">
        {paginatedHunts.length === 0 ? (
          <div className="empty-state">No verified hunts match that filter yet.</div>
        ) : (
          paginatedHunts.map((hunt) => (
            <HuntCard
              key={hunt.id}
              hunt={hunt}
              onPreview={() => handlePreview(hunt)}
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <nav aria-label="Pagination">
            <button
              type="button"
              className="page-link"
              disabled={safePage <= 1}
              onClick={() => handlePageChange(safePage - 1)}
              aria-label="Previous page"
            >
              Previous
            </button>

            {pageNumbers.map((entry, index) =>
              entry === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="page-ellipsis" aria-hidden="true">
                  &hellip;
                </span>
              ) : (
                <button
                  key={entry}
                  type="button"
                  className={`page-link${safePage === entry ? ' is-active' : ''}`}
                  onClick={() => handlePageChange(entry)}
                  aria-label={`Page ${entry}`}
                  aria-current={safePage === entry ? 'page' : undefined}
                >
                  {entry}
                </button>
              )
            )}

            <button
              type="button"
              className="page-link"
              disabled={safePage >= totalPages}
              onClick={() => handlePageChange(safePage + 1)}
              aria-label="Next page"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {selectedHunt && (
        <div className="modal-backdrop" role="presentation" onClick={closePreview}>
          <div
            ref={modalPanelRef}
            className="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-title"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <h3 id="preview-title">{selectedHunt.title}</h3>
              <button ref={closeButtonRef} type="button" className="icon-button" onClick={closePreview}>
                Close
              </button>
            </div>

            <p className="dialog-meta">
              {selectedHunt.categoryLabel} | Verified | {selectedHunt.stepCount} steps | Updated{' '}
              {toDisplayDate(selectedHunt.updatedAt)}
            </p>

            <pre>
              <code>{previewContent ?? 'Loading...'}</code>
            </pre>

            <div className="dialog-actions">
              <button
                type="button"
                className="button button-ghost"
                onClick={handleCopy}
                disabled={!previewContent}
              >
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
