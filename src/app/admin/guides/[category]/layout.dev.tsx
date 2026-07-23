import { ToolCharacterList, type ToolRow } from '@/components/admin/ToolCharacterList';
import { listGuidesByCategory } from '@/lib/data/guides';
import {
  GUIDE_CATEGORIES,
  type GuideCategory,
  type GuideCategorySlug,
} from '@/lib/data/guide-categories';
import { getMonster } from '@/lib/data/monsters';
import { EDITABLE_GENERAL_GUIDES } from '@/lib/admin/general-guide-store';
import { guideCategoryLabel } from '@/lib/admin/guide-nav';

export const dynamic = 'force-dynamic';

/**
 * Guide editor D'UN TYPE : la sidebar ne liste que les guides de la catégorie
 * courante (pas tout le corpus). general-guides = contenu bespoke, un fragment
 * éditable par slug ; les autres catégories = guides de boss du shell unifié.
 *
 * Catégorie `bossTitle` (special-request) : le guide EST la fiche d'un boss et
 * son `meta.title` est un titre SEO générique (« Strategy Guide »). On liste
 * donc par NOM DU BOSS (résolu depuis `bossId`, comme le H1 public) — sinon la
 * liste serait une colonne de titres identiques.
 */
export default async function GuideCategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const bossTitle =
    category !== 'general-guides' &&
    (GUIDE_CATEGORIES[category as GuideCategorySlug] as GuideCategory | undefined)?.bossTitle;
  const rows: ToolRow[] =
    category === 'general-guides'
      ? Object.entries(EDITABLE_GENERAL_GUIDES).map(([slug, label]) => ({
          id: `general-guides/${slug}`,
          name: label,
          done: true,
        }))
      : listGuidesByCategory(category as GuideCategorySlug).map((g) => {
          const boss = bossTitle && g.bossId ? getMonster(g.bossId) : undefined;
          return { id: `${g.category}/${g.slug}`, name: boss?.name.en || g.title.en, done: true };
        });

  return (
    <div className="flex gap-6">
      <ToolCharacterList
        title={guideCategoryLabel(category)}
        basePath="/admin/guides"
        rows={rows}
        marker="●"
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
