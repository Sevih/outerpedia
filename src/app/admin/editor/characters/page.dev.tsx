import { getCharacterListItems } from '@/lib/data/characters';
import { loadCuratedCharacters } from '@/lib/data/curated';

export const dynamic = 'force-dynamic';

/** Index Editor persos = récap de la couverture de curation. */
export default function EditorCharactersIndex() {
  const items = getCharacterListItems();
  const curated = loadCuratedCharacters();
  const curatedCount = items.filter(
    (c) => curated[c.id] && Object.keys(curated[c.id]).length,
  ).length;
  const noVideo = items.filter((c) => !curated[c.id]?.videos?.length).length;

  return (
    <div className="space-y-4">
      <h1 className="text-content-strong text-xl font-semibold">Editor · Personnage</h1>
      <dl className="grid max-w-md grid-cols-2 gap-3 text-sm">
        <div className="border-line-subtle rounded-lg border p-3">
          <dt className="text-content-subtle text-xs">Curés</dt>
          <dd className="text-content">
            {curatedCount}/{items.length}
          </dd>
        </div>
        <div className="border-line-subtle rounded-lg border p-3">
          <dt className="text-content-subtle text-xs">Sans vidéo</dt>
          <dd className={noVideo > 0 ? 'text-warn' : 'text-success'}>{noVideo}</dd>
        </div>
      </dl>
      <p className="text-content-subtle text-sm">
        Sélectionne un personnage à gauche pour éditer sa curation.
      </p>
    </div>
  );
}
