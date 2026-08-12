import heroGrowthData from '@data/generated/hero-growth.json';
import progressionData from '@data/generated/progression.json';
import transcendData from '@data/generated/transcend.json';
import eeData from '@data/generated/equipment/ee.json';
import skillsData from '@data/generated/skills.json';
import charactersData from '@data/generated/characters.json';
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
  requireLevel: number;
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

/** Équipements exclusifs, indexés par héros — un par personnage, fusionnés inclus. */
const exclusiveEquip = eeData as unknown as Record<
  string,
  { name: Record<string, string>; icon: string; grade: string }
>;
const skills = skillsData as unknown as Record<string, { type: string; icon?: string }>;
const characters = charactersData as unknown as Record<string, { skills: string[]; ee?: string }>;

/** Les quatre slots qui se montent, DANS l'ordre où l'écran les affiche. */
const SKILL_TYPES = ['first', 'second', 'ultimate', 'chain_passive'] as const;

/** Icônes des quatre skills améliorables d'un héros (vide si le type manque). */
function skillIcons(heroId: string): string[] {
  const owned = (characters[heroId]?.skills ?? []).map((id) => skills[id]).filter(Boolean);
  return SKILL_TYPES.map((type) => owned.find((s) => s.type === type)?.icon ?? '');
}

const LABEL_KEYS = [
  'intro',
  'search',
  'untrack',
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
  'shoppingList',
  'myHeroes',
  'addHero',
  'untracked',
  'heroNeeds',
  'doneHero',
  'emptyTitle',
  'emptyCta',
  'itemCount',
  'itemUnit',
  'axisAll',
  'piecesNote',
  'skillHint',
] as const;

export default async function HeroTracker({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const aliases = loadSearchAliases();

  // Couples de Core Fusion, dans les deux sens : le roster a besoin de savoir
  // qu'un héros de base a un fusionné (pour le réglage) et qu'un fusionné porte
  // son propre barème de skills.
  const fusionByBase = new Map(growth.fusion.map((f) => [f.baseId, f]));
  const fusionByHero = new Map(growth.fusion.map((f) => [f.fusionId, f]));

  /** Un EE prêt au rendu (tuile à cadre de rareté), ou rien s'il n'existe pas. */
  const eeAsset = (heroId: string): ItemAsset | null => {
    const eeId = characters[heroId]?.ee;
    const e = eeId ? exclusiveEquip[eeId] : undefined;
    return e ? { name: lRec(e.name, lang) || e.name.en, icon: e.icon, grade: e.grade } : null;
  };

  const heroes: HeroRow[] = getCharacterListItems().map((c) => {
    const asFusion = fusionByHero.get(c.id);
    const asBase = fusionByBase.get(c.id);
    // Un fusionné GARDE l'EE de sa base et en débloque un second : l'hérité
    // d'abord, le nouveau ensuite — l'ordre des barres de l'écran.
    const ee = [asFusion ? eeAsset(asFusion.baseId) : null, eeAsset(c.id)].filter(
      (a): a is ItemAsset => a !== null,
    );
    return {
      id: c.id,
      slug: slugForId(c.id) ?? c.id,
      name: characterDisplayName(c, lang),
      element: c.element,
      class: c.class,
      rarity: c.rarity,
      ...(c.gift ? { gift: c.gift } : {}),
      searchNames: characterSearchNames(c, aliases[c.id]),
      skillIcons: skillIcons(c.id),
      ee,
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
      fromLevel: s.requireLevel,
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
