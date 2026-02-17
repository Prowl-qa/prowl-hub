'use client';

import { FormEvent, useState } from 'react';

const GITHUB_NEW_FILE_URL = 'https://github.com/Prowl-qa/prowl-hub/new/main';

type SubmitState = {
  kind: 'success' | 'error';
  message: string;
} | null;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function SubmitForm() {
  const [submitState, setSubmitState] = useState<SubmitState>(null);

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
            <option value="smoke">Smoke</option>
            <option value="auth">Auth</option>
            <option value="forms">Forms</option>
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
  );
}
