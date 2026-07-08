import { AcceptTargetButton } from '@/components/admin/AcceptTargetButton';
import { getCharacterListItems } from '@/lib/data/characters';
import { reviewTarget, reviewTotals } from '@/lib/admin/review-store';

export const dynamic = 'force-dynamic';

/** Index Extractor persos = récap de l'écart extraction ↔ committé. */
export default function ExtractorCharactersIndex() {
  const items = getCharacterListItems();
  const review = reviewTarget('character');
  const total = reviewTotals(review.diff);

  return (
    <div className="space-y-4">
      <h1 className="text-content-strong text-xl font-semibold">Extractor · Personnage</h1>
      <dl className="grid max-w-md grid-cols-2 gap-3 text-sm">
        <div className="border-line-subtle rounded-lg border p-3">
          <dt className="text-content-subtle text-xs">Extraction</dt>
          <dd className={total === 0 ? 'text-success' : 'text-warn'}>
            {total === 0 ? 'à jour' : `${total} écart(s)`}
          </dd>
        </div>
        <div className="border-line-subtle rounded-lg border p-3">
          <dt className="text-content-subtle text-xs">Nouveaux</dt>
          <dd className="text-content">{review.diff.added.length}</dd>
        </div>
        <div className="border-line-subtle rounded-lg border p-3">
          <dt className="text-content-subtle text-xs">Committés</dt>
          <dd className="text-content">{items.length}</dd>
        </div>
      </dl>
      {total > 0 && (
        <div className="border-line-subtle bg-surface-raised space-y-2 rounded-lg border p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-content-strong text-sm font-medium">
              Valider toute l&apos;extraction
            </span>
            <AcceptTargetButton id={review.id} file={review.file} />
          </div>
          <p className="text-content-subtle text-xs">
            Écrit l&apos;extraction fraîche dans <code>data/generated/{review.file}</code>{' '}
            (tout-ou-rien pour les {total} écart(s)) — à committer via git. Sinon, intègre perso par
            perso depuis sa fiche.
          </p>
        </div>
      )}

      <p className="text-content-subtle text-sm">
        Sélectionne un personnage à gauche pour contrôler son extraction.
      </p>
    </div>
  );
}
