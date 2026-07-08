import { getCharacterListItems } from '@/lib/data/characters';
import { loadCuratedCharacters } from '@/lib/data/curated';

export const dynamic = 'force-dynamic';

export default function ToolSynergiesIndex() {
  const items = getCharacterListItems();
  const curated = loadCuratedCharacters();
  const done = items.filter((c) => curated[c.id]?.synergies?.length).length;

  return (
    <div className="space-y-3">
      <h1 className="text-content-strong text-xl font-semibold">Tools · Synergy</h1>
      <p className="text-content-muted text-sm">
        {done}/{items.length} persos ont des synergies. Choisis un perso à gauche pour éditer.
      </p>
    </div>
  );
}
