import { ToolCharacterList, type ToolRow } from '@/components/admin/ToolCharacterList';
import { characterDisplayName, getCharacterListItems } from '@/lib/data/characters';
import { loadCuratedCharacters } from '@/lib/data/curated';

export const dynamic = 'force-dynamic';

/** Tool transverse Synergy : liste des persos (marqueur S) + éditeur à droite. */
export default function ToolsSynergiesLayout({ children }: { children: React.ReactNode }) {
  const curated = loadCuratedCharacters();
  const rows: ToolRow[] = getCharacterListItems()
    .map((c) => ({
      id: c.id,
      name: characterDisplayName(c),
      done: Boolean(curated[c.id]?.synergies?.length),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex gap-6">
      <ToolCharacterList title="Synergy" basePath="/admin/tools/synergies" rows={rows} marker="S" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
