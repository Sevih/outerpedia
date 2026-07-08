import { ToolCharacterList, type ToolRow } from '@/components/admin/ToolCharacterList';
import { characterDisplayName, getCharacterListItems } from '@/lib/data/characters';
import { loadCuratedCharacters } from '@/lib/data/curated';

export const dynamic = 'force-dynamic';

/** Tool transverse Pro/Con : liste des persos (marqueur P) + éditeur à droite. */
export default function ToolsProsConsLayout({ children }: { children: React.ReactNode }) {
  const curated = loadCuratedCharacters();
  const rows: ToolRow[] = getCharacterListItems()
    .map((c) => ({
      id: c.id,
      name: characterDisplayName(c),
      done: Boolean(curated[c.id]?.prosCons?.pros?.length || curated[c.id]?.prosCons?.cons?.length),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex gap-6">
      <ToolCharacterList
        title="Pro / Con"
        basePath="/admin/tools/pros-cons"
        rows={rows}
        marker="P"
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
