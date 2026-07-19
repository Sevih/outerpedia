import { ToolCharacterList, type ToolRow } from '@/components/admin/ToolCharacterList';
import { listGuidesByCategory } from '@/lib/data/guides';
import type { GuideCategorySlug } from '@/lib/data/guide-categories';
import { GUIDE_SPECS } from '@/lib/admin/guide-draft';

export const dynamic = 'force-dynamic';

/** Étiquette courte de catégorie dans la liste. */
const CAT_LABEL: Record<string, string> = {
  'joint-challenge': 'JC',
  'special-request': 'SR',
  'irregular-extermination': 'IE',
  'adventure-license': 'AL',
  adventure: 'ADV',
  'dimensional-singularity': 'DS',
};

/**
 * Guide editor — liste des guides de la famille éditable (toutes catégories
 * branchées sur le shell unifié) à gauche, éditeur à droite.
 */
export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  const rows: ToolRow[] = Object.keys(GUIDE_SPECS).flatMap((cat) =>
    listGuidesByCategory(cat as GuideCategorySlug).map((g) => ({
      id: `${g.category}/${g.slug}`,
      name: `${CAT_LABEL[cat] ?? cat} · ${g.title.en}`,
      done: true,
    })),
  );

  return (
    <div className="flex gap-6">
      <ToolCharacterList title="Guides" basePath="/admin/guides" rows={rows} marker="●" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
