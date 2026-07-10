import { AcceptTargetButton } from '@/components/admin/AcceptTargetButton';
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

  return (
    <div className="space-y-4">
      <h1 className="text-content-strong text-xl font-semibold">Extractor · Monstre</h1>
      <dl className="grid max-w-xl grid-cols-2 gap-3 text-sm sm:grid-cols-4">
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
          <dt className="text-content-subtle text-xs">Modifiés</dt>
          <dd className="text-content">{review.diff.changed.length}</dd>
        </div>
        <div className="border-line-subtle rounded-lg border p-3">
          <dt className="text-content-subtle text-xs">Retenus</dt>
          <dd className="text-content">{review.diff.removed.length}</dd>
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
            Écrit l&apos;extraction fraîche dans <code>data/generated/{review.file}</code> — à
            committer via git. Sinon, enregistre monstre par monstre depuis sa fiche. Pas de
            contrôle V2 sur ce domaine (choix assumé).
          </p>
        </div>
      )}

      <p className="text-content-subtle text-sm">
        Sélectionne un monstre à gauche pour contrôler son extraction, l&apos;enregistrer ou le
        versionner.
      </p>
    </div>
  );
}
