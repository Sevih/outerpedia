import { ToolCharacterList, type ToolRow } from '@/components/admin/ToolCharacterList';
import { characterDisplayName, getCharacterListItems } from '@/lib/data/characters';
import { loadShortNames } from '@/lib/data/short-names';

export const dynamic = 'force-dynamic';

/** Tool transverse Short names : liste des persos (marqueur N) + éditeur à droite. */
export default function ToolsShortNamesLayout({ children }: { children: React.ReactNode }) {
  const shortNames = loadShortNames();
  const rows: ToolRow[] = getCharacterListItems()
    .map((c) => ({
      id: c.id,
      name: characterDisplayName(c),
      done: Boolean(shortNames[c.id] && Object.keys(shortNames[c.id]).length),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex gap-6">
      <ToolCharacterList
        title="Short names"
        basePath="/admin/tools/short-names"
        rows={rows}
        marker="N"
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
