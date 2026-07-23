import { notFound } from 'next/navigation';
import { characterDisplayName, getAllCharacters } from '@/lib/data/characters';
import { getGuide } from '@/lib/data/guides';
import { listDungeons, listGroups } from '@/lib/data/encounters';
import { listMonsters } from '@/lib/data/monsters';
import { buildInlineRefs } from '@/lib/admin/inline-refs';
import { guideSpec, isEditableGuideCategory } from '@/lib/admin/guide-draft';
import { loadGuideDraft } from '@/lib/admin/guide-store';
import {
  isEditableGeneralGuide,
  loadFreeHeroes,
  loadPremiumLimited,
} from '@/lib/admin/general-guide-store';
import { loadShopPriorities } from '@/lib/admin/shop-priorities-store';
import { GuideEditor } from '@/components/admin/GuideEditor';
import { FreeHeroesEditor } from '@/components/admin/FreeHeroesEditor';
import { PremiumLimitedEditor } from '@/components/admin/PremiumLimitedEditor';
import { ShopPrioritiesEditor } from '@/components/admin/ShopPrioritiesEditor';

export const dynamic = 'force-dynamic';

export default async function GuideEditPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const guide = getGuide(category, slug);
  if (!guide) notFound();

  const charOptions = getAllCharacters().map((c) => ({
    id: c.id,
    name: characterDisplayName(c),
    element: c.element,
    class: c.class,
    rarity: c.rarity,
  }));

  // Guides GÉNÉRAUX à fragment éditable (contenu bespoke) : éditeur dédié par slug.
  if (category === 'general-guides' && isEditableGeneralGuide(slug)) {
    const header = (
      <h1 className="text-content-strong text-xl font-semibold">
        {guide.title.en} <span className="text-content-subtle text-sm">· general-guides</span>
      </h1>
    );
    if (slug === 'premium-limited') {
      return (
        <div className="space-y-4">
          {header}
          <p className="text-content-subtle text-sm">
            Reviews are publicly contributable (Shiraen) via{' '}
            <code className="text-content">/contribute/premium-reviews</code> — import their export
            here.
          </p>
          <PremiumLimitedEditor
            initial={loadPremiumLimited()}
            refs={buildInlineRefs()}
            charOptions={charOptions}
          />
        </div>
      );
    }
    if (slug === 'shop-purchase-priorities') {
      return (
        <div className="space-y-4">
          {header}
          <ShopPrioritiesEditor initial={loadShopPriorities()} refs={buildInlineRefs()} />
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {header}
        <FreeHeroesEditor
          slug={slug}
          initial={loadFreeHeroes()}
          refs={buildInlineRefs()}
          charOptions={charOptions}
        />
      </div>
    );
  }

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
