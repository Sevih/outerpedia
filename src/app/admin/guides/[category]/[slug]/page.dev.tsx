import { notFound } from 'next/navigation';
import { characterDisplayName, getAllCharacters } from '@/lib/data/characters';
import { getGuide } from '@/lib/data/guides';
import { listDungeons, listGroups } from '@/lib/data/encounters';
import { listMonsters } from '@/lib/data/monsters';
import { buildInlineRefs } from '@/lib/admin/inline-refs';
import { guideSpec, isEditableGuideCategory } from '@/lib/admin/guide-draft';
import { loadGuideDraft } from '@/lib/admin/guide-store';
import { GuideEditor } from '@/components/admin/GuideEditor';

export const dynamic = 'force-dynamic';

export default async function GuideEditPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const guide = getGuide(category, slug);
  if (!guide) notFound();

  // Catégories branchées sur le shell unifié (cf. GUIDE_SPECS). Les autres
  // (adventure, dimensional-singularity, tower…) suivront / restent hors scope.
  if (!isEditableGuideCategory(category)) {
    return (
      <p className="text-content-muted text-sm">
        La catégorie « {category} » n’est pas encore éditable ici.
      </p>
    );
  }

  const draft = loadGuideDraft(category, slug);
  const spec = guideSpec(category)!;
  const charOptions = getAllCharacters().map((c) => ({
    id: c.id,
    name: characterDisplayName(c),
    element: c.element,
    class: c.class,
    rarity: c.rarity,
  }));
  // Options du picker de monstre selon la catégorie (une seule est pertinente).
  const usesGroup = spec.monster === 'group-config' || spec.monster === 'group-meta';
  const groupOptions = usesGroup ? listGroups('en') : [];
  const dungeonOptions = spec.monster === 'dungeons-meta' ? listDungeons('en') : [];
  const monsterOptions = spec.monster === 'bossId-meta' ? listMonsters('en') : [];

  return (
    <div className="space-y-4">
      <h1 className="text-content-strong text-xl font-semibold">
        {guide.title.en} <span className="text-content-subtle text-sm">· {category}</span>
      </h1>
      <GuideEditor
        category={category}
        slug={slug}
        initial={draft}
        refs={buildInlineRefs()}
        charOptions={charOptions}
        groupOptions={groupOptions}
        dungeonOptions={dungeonOptions}
        monsterOptions={monsterOptions}
      />
    </div>
  );
}
