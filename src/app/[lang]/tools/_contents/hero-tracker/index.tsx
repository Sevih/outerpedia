import heroGrowthData from '@data/generated/hero-growth.json';
import progressionData from '@data/generated/progression.json';
import transcendData from '@data/generated/transcend.json';
import type { HeroGrowthData } from '@datagen/generators/hero-growth';
import { getT, type TranslationKey } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { getCatalogEntry } from '@/lib/data/items';
import {
  characterDisplayName,
  characterSearchNames,
  getCharacterListItems,
  slugForId,
} from '@/lib/data/characters';
import { loadSearchAliases } from '@/lib/data/search-aliases';
import {
  HeroTrackerBrowser,
  type HeroRow,
  type HeroTrackerLabels,
  type ItemAsset,
  type TranscendStep,
} from './HeroTrackerBrowser';
import type { LimitBreakCost } from './engine';

/**
 * Suivi de compte — wrapper SERVEUR : assemble les barèmes (croissance, limit
 * break par élément, transcendance, Core Fusion), résout les items qu'ils citent
 * et pré-traduit les libellés. Tout le reste — l'état du compte — vit côté client.
 */

const growth = heroGrowthData as unknown as HeroGrowthData;

/** `progression.limitBreak` est indexé `${rareté}_${élément}` (mémoire par élément). */
interface ProgressionLimitBreakStep {
  maxLevel: number;
  pieces: number;
  recallItemId: string;
  price: number;
}
const progressionLimitBreak = progressionData.limitBreak as unknown as Record<
  string,
  ProgressionLimitBreakStep[]
>;

const transcend = transcendData as unknown as {
  byStar: Record<string, TranscendStep[]>;
  overrides: Record<string, TranscendStep[]>;
};

const LABEL_KEYS = [
  'intro',
  'search',
  'trackedOnly',
  'track',
  'untrack',
  'current',
  'target',
  'level',
  'skills',
  'fusionLevel',
  'affinity',
  'transcend',
  'ee',
  'eeFusion',
  'needTitle',
  'needEmpty',
  'gold',
  'xp',
  'affinityPoints',
  'pieces',
  'dupes',
  'giftNote',
  'giftNoteBonus',
  'reset',
  'resetConfirm',
  'trackedCount',
  'settings',
  'settingsFusion',
  'settingsFusionHint',
  'base',
  'coreFusion',
  'preferredGift',
  'alwaysMax',
] as const;

export default async function HeroTracker({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const aliases = loadSearchAliases();

  // Couples de Core Fusion, dans les deux sens : le roster a besoin de savoir
  // qu'un héros de base a un fusionné (pour le réglage) et qu'un fusionné porte
  // son propre barème de skills.
  const fusionByBase = new Map(growth.fusion.map((f) => [f.baseId, f]));
  const fusionByHero = new Map(growth.fusion.map((f) => [f.fusionId, f]));

  const heroes: HeroRow[] = getCharacterListItems().map((c) => {
    const asFusion = fusionByHero.get(c.id);
    const asBase = fusionByBase.get(c.id);
    return {
      id: c.id,
      slug: slugForId(c.id) ?? c.id,
      name: characterDisplayName(c, lang),
      element: c.element,
      class: c.class,
      rarity: c.rarity,
      ...(c.gift ? { gift: c.gift } : {}),
      searchNames: characterSearchNames(c, aliases[c.id]),
      ...(asFusion
        ? {
            fusionLevels: asFusion.levels,
            baseId: asFusion.baseId,
            requiredStar: asFusion.requiredStar,
          }
        : {}),
      ...(asBase ? { fusionId: asBase.fusionId } : {}),
    };
  });

  // Barème de limit break réduit à ce que le moteur consomme.
  const limitBreak: Record<string, LimitBreakCost[]> = {};
  for (const [key, steps] of Object.entries(progressionLimitBreak)) {
    limitBreak[key] = steps.map((s) => ({
      maxLevel: s.maxLevel,
      pieces: s.pieces,
      recallItemId: s.recallItemId,
      price: s.price,
    }));
  }

  // Items CITÉS par les barèmes : manuels de skill, mémoires de limit break,
  // matériaux d'enchantement EE, cores de fusion. Les plats et cadeaux portent
  // déjà leur nom.
  const items: Record<string, ItemAsset> = {};
  const addItem = (id: string) => {
    if (items[id]) return;
    const e = getCatalogEntry(id);
    if (e) items[id] = { name: lRec(e.name, lang) || e.name.en, icon: e.icon, grade: e.grade };
  };
  for (const rows of Object.values(growth.skillUpgrade))
    for (const r of rows) for (const m of r.manuals) addItem(m.item.id);
  for (const r of growth.specialEquip.ee) for (const m of r.materials) addItem(m.item.id);
  for (const steps of Object.values(limitBreak)) for (const s of steps) addItem(s.recallItemId);
  for (const f of growth.fusion) for (const l of f.levels) addItem(l.cost.item.id);

  const labels = Object.fromEntries(
    LABEL_KEYS.map((k) => [k, t(`tools.hero-tracker.${k}` as TranslationKey)]),
  ) as unknown as HeroTrackerLabels;

  return (
    <HeroTrackerBrowser
      heroes={heroes}
      rules={{
        xpCurve: growth.xpCurve,
        affinityCurve: growth.affinityCurve,
        gifts: growth.gifts,
        xpFood: growth.xpFood,
        skillUpgrade: growth.skillUpgrade,
        limitBreak,
        eeEnchant: growth.specialEquip.ee,
      }}
      transcend={transcend}
      items={items}
      labels={labels}
    />
  );
}
