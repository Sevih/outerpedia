import { AcceptTargetButton } from '@/components/admin/AcceptTargetButton';
import { getCharacterListItems } from '@/lib/data/characters';
import { reviewBuckets, reviewTarget, reviewTotals } from '@/lib/admin/review-store';

export const dynamic = 'force-dynamic';

/** Index Extractor persos = récap de l'écart extraction ↔ committé. */
export default function ExtractorCharactersIndex() {
  const items = getCharacterListItems();
  const review = reviewTarget('character');
  const total = reviewTotals(review.diff);
  const buckets = reviewBuckets(review.diff);
  // Retouches mineures (texte reformulé, costume ajouté ou déplacé) et typos :
  // s'appliquent d'un geste, sans ré-intégrer les persos concernés.
  const soft = buckets.minor + buckets.typo;

  return (
    <div className="space-y-4">
      <h1 className="text-content-strong text-xl font-semibold">Extractor · Character</h1>
      <dl className="grid max-w-md grid-cols-2 gap-3 text-sm">
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
          <dt className="text-content-subtle text-xs">Diff</dt>
          <dd className={buckets.diff ? 'text-warn' : 'text-content'}>{buckets.diff}</dd>
        </div>
        <div className="border-line-subtle rounded-lg border p-3">
          <dt className="text-content-subtle text-xs">Minor</dt>
          <dd className="text-content-muted">
            {buckets.minor}
            {buckets.typo > 0 && ` + ${buckets.typo} typo`}
          </dd>
        </div>
        <div className="border-line-subtle rounded-lg border p-3">
          <dt className="text-content-subtle text-xs">Committed</dt>
          <dd className="text-content">{items.length}</dd>
        </div>
      </dl>
      {soft > 0 && (
        <div className="border-line-subtle bg-surface-raised space-y-2 rounded-lg border p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-content-strong text-sm font-medium">Apply minor changes</span>
            <AcceptTargetButton
              id={review.id}
              file={review.file}
              mode="minor"
              label={`Apply (${soft})`}
            />
          </div>
          <p className="text-content-subtle text-xs">
            Writes only the {soft} character(s) whose changes are minor (reworded text without a
            number changed, costume added or reordered) or typos, and stages the missing images of a
            new costume — no re-integration. Real differences stay for review.
          </p>
        </div>
      )}
      {total > 0 && (
        <div className="border-line-subtle bg-surface-raised space-y-2 rounded-lg border p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-content-strong text-sm font-medium">
              Accept the whole extraction
            </span>
            <AcceptTargetButton id={review.id} file={review.file} />
          </div>
          <p className="text-content-subtle text-xs">
            Writes the fresh extraction to <code>data/generated/{review.file}</code> (all-or-nothing
            for the {total} diff(s)) — to commit via git. Otherwise, integrate character by
            character from its page.
          </p>
        </div>
      )}

      <p className="text-content-subtle text-sm">
        Select a character on the left to review its extraction.
      </p>
    </div>
  );
}
