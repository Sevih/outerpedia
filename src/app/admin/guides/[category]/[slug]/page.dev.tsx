import { notFound } from 'next/navigation';
import { characterDisplayName, getAllCharacters } from '@/lib/data/characters';
import { getGuide } from '@/lib/data/guides';
import { encounterLabel, encountersOfGroup, listDungeons, listGroups } from '@/lib/data/encounters';
import {
  listMonsters,
  monsterArchives,
  monsterDisplayNames,
  monsterIconSrc,
  getMonster,
} from '@/lib/data/monsters';
import { buildInlineRefs } from '@/lib/admin/inline-refs';
import { getT } from '@/i18n';
import { guideSpec, isEditableGuideCategory, type GuideDraft } from '@/lib/admin/guide-draft';
import { loadGuideDraft } from '@/lib/admin/guide-store';
import {
  isEditableGeneralGuide,
  loadFreeHeroes,
  loadPremiumLimited,
} from '@/lib/admin/general-guide-store';
import { loadShopPriorities } from '@/lib/admin/shop-priorities-store';
import { GuideEditor } from '@/components/admin/GuideEditor';
import type { PinTarget } from '@/components/admin/VersionPinPicker';
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
  // RESTREINT au mode de la catégorie : un joint challenge ne désigne pas un
  // guild raid. Sans ça le sélecteur sortait les 69 combats du jeu là où 5 sont
  // valides — la bonne réponse se cherchait parmi ses homonymes.
  const groupOptions = usesGroup ? listGroups('en', spec.groupModes) : [];
  // ÉPINGLAGE : ce qu'une version peut réellement figer, c'est-à-dire les
  // monstres de SON combat et les archives qui existent pour eux. Le combat, lui,
  // n'est pas un choix de version — mesuré sur les 16 guides versionnés, aucun
  // n'en change d'une version à l'autre : il appartient au GUIDE.
  const pinTargets = spec.versioned ? await buildPinTargets(draft) : [];
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
        pinTargets={pinTargets}
      />
    </div>
  );
}

/**
 * Les monstres du combat d'un guide, chacun avec les états FIGÉS qu'on peut lui
 * choisir. Le combat est pris sur la première version qui en déclare un : il
 * appartient au guide, pas à la version (vérifié sur les 16 guides versionnés —
 * aucun n'en change), et une version « legacy » sans combat n'a donc rien à
 * épingler mais ne prive pas les autres.
 *
 * Un monstre SANS archive reste listé : c'est ce qui dit « celui-là n'a jamais
 * été versionné », alors que son absence se lirait comme un oubli du scan.
 */
async function buildPinTargets(draft: GuideDraft): Promise<PinTarget[]> {
  const group = draft.versions.find((v) => v.group)?.group;
  if (!group) return [];
  const t = await getT('en');
  // Par ID, pas par rencontre : un même monstre peut tenir plusieurs difficultés
  // (world boss), et il ne se fige qu'une fois — la liste `pinned` est indexée
  // par monstre. On garde les difficultés pour le NOMMER à l'écran.
  const byId = new Map<string, string[]>();
  for (const enc of encountersOfGroup(group)) {
    const label = encounterLabel(enc.ref, 'en', t);
    for (const m of enc.monsters) byId.set(m.id, [...(byId.get(m.id) ?? []), label]);
  }
  const names = monsterDisplayNames([...byId.keys()], 'en');
  return [...byId].map(([id, where]) => {
    const monster = getMonster(id);
    return {
      id,
      name: names.get(id) ?? id,
      where,
      ...(monster ? { icon: monsterIconSrc(monster) } : {}),
      archives: monsterArchives(id),
    };
  });
}
