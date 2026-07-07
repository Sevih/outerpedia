import { getCharacterListItems } from '@/lib/data/characters';
import { loadCuratedCharacters } from '@/lib/data/curated';
import { reviewTarget, reviewTotals } from '@/lib/admin/review-store';

export const dynamic = 'force-dynamic';

/** Index persos = récap ; la navigation se fait par le menu de gauche. */
export default function AdminCharactersIndex() {
  const items = getCharacterListItems();
  const curated = loadCuratedCharacters();
  const review = reviewTarget('character');
  const total = reviewTotals(review.diff);
  const curatedCount = items.filter(
    (c) => curated[c.id] && Object.keys(curated[c.id]).length,
  ).length;
  const noVideo = items.filter((c) => !curated[c.id]?.videos?.length).length;

  return (
    <div className="space-y-4">
      <h1 className="text-content-strong text-xl font-semibold">Personnages</h1>
      <dl className="grid max-w-md grid-cols-2 gap-3 text-sm">
        <div className="border-line-subtle rounded-lg border p-3">
          <dt className="text-content-subtle text-xs">Extraction</dt>
          <dd className={total === 0 ? 'text-success' : 'text-warn'}>
            {total === 0 ? 'à jour' : `${total} écart(s)`}
          </dd>
        </div>
        <div className="border-line-subtle rounded-lg border p-3">
          <dt className="text-content-subtle text-xs">Curés</dt>
          <dd className="text-content">
            {curatedCount}/{items.length}
          </dd>
        </div>
        <div className="border-line-subtle rounded-lg border p-3">
          <dt className="text-content-subtle text-xs">Sans vidéo</dt>
          <dd className="text-content">{noVideo}</dd>
        </div>
      </dl>
      <p className="text-content-subtle text-sm">Sélectionne un personnage dans le menu.</p>
    </div>
  );
}
