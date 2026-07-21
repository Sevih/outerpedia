/**
 * Payloads de l'API INTERNE du bot Discord (outerbot) — servis par
 * `src/app/api/bot/*`. Contrat volontairement MINCE et PRÉ-FORMATÉ : le bot ne
 * connaît ni LangDict, ni familles, ni passifs — il affiche des chaînes EN
 * telles quelles dans ses embeds (miroir des interfaces `Wiki*` de
 * outerbot/src/wiki/client.ts — toute évolution se fait des deux côtés).
 *
 * Les chemins d'images sont RELATIFS (`/images/...`) : le bot préfixe sa
 * propre base (IMG_BASE_URL → R2), comme le site préfixe la sienne.
 */
import type { PassiveRef } from '@contracts';
import type { TFunction } from '@/i18n';
import {
  characterDisplayName,
  getAllCharacters,
  getCharacter,
  slugForId,
} from '@/lib/data/characters';
import { listGuides } from '@/lib/data/guides';
import {
  getAmuletFamilies,
  getEEViews,
  getSetViews,
  getTalismanFamilies,
  getWeaponFamilies,
  resolvePassives,
  shopSourceLabel,
  slugifyEquipment,
  withClassSuffix,
  type GearFamily,
  type ResolvedSource,
} from '@/lib/data/equipment';

/** Un perso pour le bot (création de post forum + /char) — id V3 (face icon FI_). */
export interface BotCharacter {
  slug: string;
  name: string;
  element: string;
  class: string;
  rarity: number;
  id: string;
}

/** Un guide pour /guide — le lien se reconstruit en `/guides/<category>/<slug>`. */
export interface BotGuide {
  category: string;
  slug: string;
  title: string;
}

/** Un équipement pour /item — champs des embeds, tout est déjà du texte. */
export interface BotItem {
  type: 'weapon' | 'amulet' | 'set' | 'talisman' | 'ee';
  slug: string;
  name: string;
  icon: string;
  classLimit?: string;
  effectName?: string;
  effectTiers?: string[];
  source?: string;
  characterName?: string;
}

/** Persos PUBLIÉS (ceux qui ont une fiche), nom d'affichage EN, triés par nom. */
export function buildBotCharacters(): BotCharacter[] {
  return getAllCharacters()
    .flatMap((c) => {
      const slug = slugForId(c.id);
      if (!slug) return [];
      return [
        {
          slug,
          name: characterDisplayName(c, 'en'),
          element: c.element,
          class: c.class,
          rarity: c.rarity,
          id: c.id,
        },
      ];
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Guides visibles (les `hidden` restent hors Discord, comme hors listes). */
export function buildBotGuides(): BotGuide[] {
  return listGuides()
    .filter((g) => !g.hidden)
    .map((g) => ({ category: g.category, slug: g.slug, title: g.title.en }));
}

const cap = (s: string): string => (s ? s[0]!.toUpperCase() + s.slice(1) : s);

/** Les textes de jeu portent des balises `<color=…>` — un embed Discord n'en veut pas. */
const stripColors = (s: string): string => s.replace(/<\/?color[^>]*>/g, '');

/**
 * Passifs d'un item en lignes d'embed : une ligne par palier, au reforge MAX
 * (la valeur que le joueur vise — montrer min et max doublerait la taille pour
 * rien, un embed est borné à 1024 caractères par champ).
 */
function passiveView(refs: PassiveRef[]): { effectName?: string; effectTiers?: string[] } {
  const resolved = resolvePassives(refs, 'en');
  if (!resolved.length) return {};
  return {
    effectName: resolved[0].name,
    effectTiers: resolved.map((p) => `Lv.${p.level}: ${stripColors(p.last ?? p.first)}`),
  };
}

/** Source d'obtention en une chaîne (même assemblage que la page détail). */
function sourceText(source: ResolvedSource | undefined, t: TFunction): string | undefined {
  if (!source) return undefined;
  const parts = [
    ...source.bosses.map((b) => b.name.en),
    ...source.shops.map((s) => shopSourceLabel(s, t)),
    ...(source.label ? [source.label] : []),
  ];
  return parts.length ? parts.join(' · ') : undefined;
}

/**
 * Items d'un slot de familles. Une famille multi-classes (Briareos/Gorgon)
 * s'éclate en UNE entrée PAR variante — comme ses pages détail : nom suffixé
 * `[Defender]`, slug/icône/passif de la variante.
 */
function familyItems(type: BotItem['type'], families: GearFamily[], t: TFunction): BotItem[] {
  return families.flatMap((f) => {
    const source = sourceText(f.source, t);
    if (f.classPassives) {
      return f.classPassives.map((v) => ({
        type,
        slug: v.slug,
        name: withClassSuffix(f.name, v.classLimit).en,
        icon: `/images/equipment/${v.icon}.webp`,
        classLimit: cap(v.classLimit),
        ...passiveView(v.passives),
        ...(source ? { source } : {}),
      }));
    }
    return [
      {
        type,
        slug: f.slug,
        name: f.name.en,
        icon: `/images/equipment/${f.icon}.webp`,
        ...(f.classLimits.length ? { classLimit: f.classLimits.map(cap).join(' / ') } : {}),
        ...passiveView(f.passives),
        ...(source ? { source } : {}),
      },
    ];
  });
}

/** Tout le catalogue /item : armes, amulettes, sets, talismans, EE. */
export function buildBotItems(t: TFunction): BotItem[] {
  const sets: BotItem[] = getSetViews('en').map((s) => {
    const source = sourceText(s.source, t);
    return {
      type: 'set',
      slug: s.slug,
      name: s.name.en,
      icon: `/images/equipment/${s.icon}.webp`,
      effectName: 'Set Effects',
      // Palier 0 = base, palier 1 = set enchanté (mêmes libellés que le site).
      effectTiers: s.tiers.flatMap((tier, i) => {
        const tag = i === 0 ? '' : ' (enchanted)';
        return [
          ...(tier.p2 ? [`2-Set${tag}: ${stripColors(tier.p2)}`] : []),
          ...(tier.p4 ? [`4-Set${tag}: ${stripColors(tier.p4)}`] : []),
        ];
      }),
      ...(source ? { source } : {}),
    };
  });

  const ee: BotItem[] = getEEViews().map((e) => {
    const owner = getCharacter(e.characterId);
    return {
      type: 'ee',
      slug: slugifyEquipment(e.name.en),
      name: e.name.en,
      icon: `/images/characters/ee/${e.characterId}.webp`,
      ...(owner ? { classLimit: cap(owner.class) } : {}),
      ...passiveView(e.passives),
      ...(owner ? { characterName: characterDisplayName(owner, 'en') } : {}),
    };
  });

  return [
    ...familyItems('weapon', getWeaponFamilies(), t),
    ...familyItems('amulet', getAmuletFamilies(), t),
    ...sets,
    ...familyItems('talisman', getTalismanFamilies(), t),
    ...ee,
  ].sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
}
