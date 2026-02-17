import type { HuntSummary } from '@/lib/hunts';
import { toDisplayDate } from '@/lib/format';

interface HuntCardProps {
  hunt: HuntSummary;
  showTags?: boolean;
  onPreview?: () => void;
}

export default function HuntCard({ hunt, showTags = true, onPreview }: HuntCardProps) {
  const tags = (hunt.tags || []).filter((tag) => tag.trim().length > 0 && !tag.trim().startsWith('#'));

  return (
    <article className="hunt-card">
      {hunt.isVerified && <span className="verified-badge">Verified</span>}
      <h3>{hunt.title}</h3>
      <p>{hunt.description || 'Reusable hunt template.'}</p>

      <div className="meta-row">
        <span className="meta-pill">{hunt.categoryLabel}</span>
        {hunt.isNew && <span className="meta-pill meta-pill-new">New</span>}
      </div>

      <div className="meta-row">
        <span className="meta-pill">{hunt.stepCount} steps</span>
        <span className="meta-pill">{hunt.assertionCount} assertions</span>
        <span className="meta-pill">Updated {toDisplayDate(hunt.updatedAt)}</span>
      </div>

      {showTags && tags.length > 0 && (
        <div className="meta-row">
          {tags.map((tag) => (
            <span key={tag} className="meta-pill meta-pill-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="hunt-actions">
        {onPreview && (
          <button type="button" className="button button-ghost" onClick={onPreview}>
            Preview YAML
          </button>
        )}
        <a
          className="button button-primary"
          href={`/api/hunts/file?path=${encodeURIComponent(hunt.filePath)}`}
          download={hunt.filePath.split('/').pop() || 'hunt.yml'}
        >
          Download
        </a>
      </div>
    </article>
  );
}
