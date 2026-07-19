import { AcceptTargetButton } from '@/components/admin/AcceptTargetButton';
import { IntegrateModeButton } from '@/components/admin/IntegrateModeButton';
import { buildMonsterRows } from '@/lib/admin/monster-rows';
import { reviewTarget, reviewTotals } from '@/lib/admin/review-store';

export const dynamic = 'force-dynamic';

/**
 * Index Extractor monstres = récap de l'écart extraction ↔ committé.
 * ⚠ Plusieurs boss DISTINCTS portent le même nom (modes/stages différents) :
 * l'identité est l'ID, jamais le nom — la sidebar affiche id + type + élément.
 */
export default function ExtractorMonstersIndex() {
  const review = reviewTarget('monster');
  const total = reviewTotals(review.diff);
  const { modeOptions } = buildMonsterRows();

  return (
    <div className="space-y-4">
      <h1 className="text-content-strong text-xl font-semibold">Extractor · Monster</h1>
      <dl className="grid max-w-xl grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div className="border-line-subtle rounded-lg border p-3">
          <dt className="text-content-subtle text-xs">Extraction</dt>
          <dd className={total === 0 ? 'text-success' : 'text-warn'}>
            {total === 0 ? 'up to date' : `${total} diff(s)`}
          </dd>
        </div>
        <div className="border-line-subtle rounded-lg border p-3">
          <dt className="text-content-subtle text-xs">New</dt>
          <dd className="text-content">{review.diff.added.length}</dd>
        </div>
        <div className="border-line-subtle rounded-lg border p-3">
          <dt className="text-content-subtle text-xs">Changed</dt>
          <dd className="text-content">{review.diff.changed.length}</dd>
        </div>
        <div className="border-line-subtle rounded-lg border p-3">
          <dt className="text-content-subtle text-xs">Removed</dt>
          <dd className="text-content">{review.diff.removed.length}</dd>
        </div>
      </dl>

      {total > 0 && (
        <div className="border-line-subtle bg-surface-raised space-y-2 rounded-lg border p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-content-strong text-sm font-medium">
              Accept the whole extraction
            </span>
            <AcceptTargetButton id={review.id} file={review.file} />
          </div>
          <p className="text-content-subtle text-xs">
            Writes the fresh extraction to <code>data/generated/{review.file}</code> — to commit via
            git. Otherwise, save monster by monster from its page.
          </p>
        </div>
      )}

      <div className="border-line-subtle bg-surface-raised space-y-2 rounded-lg border p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-content-strong text-sm font-medium">Save a whole mode</span>
          <IntegrateModeButton modes={modeOptions} />
        </div>
        <p className="text-content-subtle text-xs">
          Saves each monster spawning in a dungeon of the mode (+ its summoned/linked adds) to{' '}
          <code>data/generated/</code> — same action as a page&apos;s “Save”, in bulk. To commit via
          git.
        </p>
      </div>

      <p className="text-content-subtle text-sm">
        Select a monster on the left to review its extraction, save it or version it.
      </p>
    </div>
  );
}
