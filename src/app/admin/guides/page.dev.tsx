import { ContributionImport } from '@/components/admin/ContributionImport';

export const dynamic = 'force-dynamic';

export default function GuidesIndex() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-content-strong text-xl font-semibold">Guide editor</h1>
        <p className="text-content-muted text-sm">
          Pick a guide on the left to edit it. Boss family wired: <strong>joint-challenge</strong>{' '}
          &amp; <strong>world-boss</strong> (versioned), <strong>special-request</strong>,{' '}
          <strong>irregular-extermination</strong>, <strong>adventure-license</strong>,{' '}
          <strong>adventure</strong>, <strong>dimensional-singularity</strong> — monster + tips +
          heroes + team + videos, depending on the category.
        </p>
      </div>
      <ContributionImport />
    </div>
  );
}
