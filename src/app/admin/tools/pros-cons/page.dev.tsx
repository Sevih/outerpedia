import { getCharacterListItems } from '@/lib/data/characters';
import { loadCuratedCharacters } from '@/lib/data/curated';

export const dynamic = 'force-dynamic';

export default function ToolProsConsIndex() {
  const items = getCharacterListItems();
  const curated = loadCuratedCharacters();
  const done = items.filter(
    (c) => curated[c.id]?.prosCons?.pros?.length || curated[c.id]?.prosCons?.cons?.length,
  ).length;

  return (
    <div className="space-y-3">
      <h1 className="text-content-strong text-xl font-semibold">Tools · Pro / Con</h1>
      <p className="text-content-muted text-sm">
        {done}/{items.length} persos ont des pros/cons. Choisis un perso à gauche pour éditer.
      </p>
    </div>
  );
}
