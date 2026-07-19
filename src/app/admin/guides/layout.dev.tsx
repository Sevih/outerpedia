import { ToolCharacterList, type ToolRow } from '@/components/admin/ToolCharacterList';
import { listGuidesByCategory } from '@/lib/data/guides';

export const dynamic = 'force-dynamic';

/**
 * Guide editor — pilote joint-challenge : liste des guides (marqueur JC) à
 * gauche, éditeur unifié à droite. Les autres catégories de la famille
 * (special-request, irregular…) rejoindront cette liste ensuite.
 */
export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  const rows: ToolRow[] = listGuidesByCategory('joint-challenge').map((g) => ({
    id: `${g.category}/${g.slug}`,
    name: g.title.en,
    done: true,
  }));

  return (
    <div className="flex gap-6">
      <ToolCharacterList title="Joint Challenge" basePath="/admin/guides" rows={rows} marker="JC" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
