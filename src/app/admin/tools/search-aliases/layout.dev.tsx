import { ToolCharacterList, type ToolRow } from '@/components/admin/ToolCharacterList';
import { characterDisplayName, getCharacterListItems } from '@/lib/data/characters';
import { loadSearchAliases } from '@/lib/data/search-aliases';

export const dynamic = 'force-dynamic';

/** Tool transverse Search aliases : liste des persos (marqueur S) + éditeur à droite. */
export default function ToolsSearchAliasesLayout({ children }: { children: React.ReactNode }) {
  const aliases = loadSearchAliases();
  const rows: ToolRow[] = getCharacterListItems()
    .map((c) => ({
      id: c.id,
      name: characterDisplayName(c),
      done: Boolean(aliases[c.id]?.length),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex gap-6">
      <ToolCharacterList
        title="Search aliases"
        basePath="/admin/tools/search-aliases"
        rows={rows}
        marker="S"
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
