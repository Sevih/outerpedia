import {
  characterDisplayName,
  characterNamePrefix,
  characterSearchNames,
  getCharacterListItems,
  slugForId,
} from '@/lib/data/characters';
import { characterTags, loadCuratedCharacters } from '@/lib/data/curated';
import { loadSearchAliases } from '@/lib/data/search-aliases';
import { getEEViews, passiveEffects, resolvePassives } from '@/lib/data/equipment';
import { eeCuratedChips } from '@/lib/data/equipment-detail';
import { statAbbr } from '@/lib/stats';
import type { EffectShape, PassiveRef } from '@contracts';

/**
 * Données de l'outil de contribution « ranking helper » (`/contribute/
 * ranking-helper`) : pour DISCUTER le rang d'un perso il faut sa fiche
 * condensée (rôle, tags, EE) ET ses homologues dans chaque classement — tout
 * est déjà public ailleurs (tier lists, fiches), l'outil ne fait que le
 * JOINDRE en une seule vue. Textes en ANGLAIS seul, comme tout `/contribute`
 * (la langue de travail des contributeurs).
 */

export interface RankingHelperEE {
  name: string;
  /** Paliers résolus : niv. 1 puis niv. 10 (remplace ou s'ajoute). */
  passives: Array<{ level: number; isAdd: boolean; text: string }>;
  /**
   * Chips d'effets telles qu'affichées sur la carte EE (curation appliquée) —
   * le vocabulaire de la comparaison « effets similaires » : en mode EE, les
   * homologues sont les porteurs d'un EE partageant au moins une chip active.
   */
  chips: Array<{ ref: string; name: string; icon?: string; isDebuff: boolean }>;
}

export interface RankingHelperRow {
  id: string;
  slug: string;
  name: string;
  prefix?: string;
  searchNames: string[];
  element: string;
  class: string;
  rarity: number;
  role?: string;
  tags: string[];
  ranks: { pve?: string; pvp?: string; eeBase?: string; eePlus10?: string };
  ee?: RankingHelperEE;
}

/**
 * Libellés lisibles des TYPES d'effet sans statut nommé (repli : type
 * prettifié). Inventaire mesuré sur les 124 EE du 03/08 — 41 n'ont AUCUNE
 * chip nommée (« Penetration against bosses +30% » est un effet de stat pur,
 * sans tooltip ni label) : sans cette couche, un tiers du roster était
 * incomparable et l'UI concluait à tort « pas d'EE ».
 */
const TYPE_LABELS: Record<string, string> = {
  BT_DMG: 'DMG bonus',
  BT_DMG_TO_BOSS: 'DMG vs bosses',
  BT_GROUP: 'Group bonus',
  BT_DMG_REDUCE: 'DMG reduction',
  BT_DMG_ENEMY_TEAM_DECREASE: 'Enemy team DMG down',
  BT_BLEED_ENHANCE: 'Bleed enhance',
  BT_POISON_ENHANCE: 'Poison enhance',
  BT_RESOURCE_CHARGE_BUFF_CASTER: 'Resource charge',
  BT_ACTION_GAUGE_ENHANCE: 'Action gauge boost',
  BT_DMG_CASTER_LOST_HP_RATE: 'DMG scaling with lost HP',
  BT_HEAL: 'Heal',
  BT_STAT: 'Stat bonus',
  BT_STAT_PREMIUM: 'Stat bonus',
};

function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type.replace(/^BT_/, '').replace(/_/g, ' ').toLowerCase();
}

type ComparisonChip = { ref: string; name: string; icon?: string; isDebuff: boolean };

/**
 * Vocabulaire de comparaison d'un EE, en DEUX couches :
 * 1. les chips NOMMÉES de sa carte (curation appliquée) — refs de glossaire ;
 * 2. des clés SYNTHÉTIQUES pour les effets structurés restants :
 *    - stat pure → `stat:<stat>:<dir>` (« PEN% up » matche « PEN% up »,
 *      que le texte parle de boss ou non — c'est le but : Triaena et
 *      Frost Nova +10 portent le même `pierce_power_rate` up) ;
 *    - autre famille → clé par type, éventuellement affinée par la stat
 *      support (un « DMG scaling Speed » ne matche pas un buff de Speed).
 */
function eeComparisonChips(characterId: string, passives: PassiveRef[]): ComparisonChip[] {
  const out: ComparisonChip[] = eeCuratedChips(characterId, 'en').map((chip) => ({
    ref: `ref:${chip.ref}`,
    name: chip.name,
    ...(chip.icon ? { icon: chip.icon } : {}),
    isDebuff: chip.isDebuff,
  }));
  const seen = new Set(out.map((c) => c.ref));
  const add = (chip: ComparisonChip) => {
    if (seen.has(chip.ref)) return;
    seen.add(chip.ref);
    out.push(chip);
  };
  for (const e of passiveEffects(passives) as EffectShape[]) {
    const isDebuff = e.category === 'debuff' || e.category === 'cc';
    if (e.family === 'stat' && e.stat) {
      const dir = e.mode === 'down' ? 'down' : 'up';
      add({ ref: `stat:${e.stat}:${dir}`, name: `${statAbbr(e.stat)} ${dir}`, isDebuff });
      continue;
    }
    // Effet déjà représenté par une chip nommée : ne pas doubler d'une clé
    // de type générique (bruit) — la couche 2 ne couvre que les muets.
    if (e.tooltip || e.label) continue;
    if (e.stat) add({ ref: `${e.family}:${e.type}:${e.stat}`, name: typeLabel(e.type), isDebuff });
    else add({ ref: `type:${e.type}`, name: typeLabel(e.type), isDebuff });
  }
  return out;
}

export function rankingHelperRows(): RankingHelperRow[] {
  const curated = loadCuratedCharacters();
  const aliases = loadSearchAliases();
  const eeByCharacter = new Map(getEEViews().map((v) => [v.characterId, v]));

  return getCharacterListItems().map((c) => {
    const cu = curated[c.id] ?? {};
    const ee = eeByCharacter.get(c.id);
    return {
      id: c.id,
      slug: slugForId(c.id) ?? c.id,
      name: characterDisplayName(c, 'en'),
      prefix: characterNamePrefix(c, 'en') ?? undefined,
      searchNames: characterSearchNames(c, aliases[c.id]),
      element: c.element,
      class: c.class,
      rarity: c.rarity,
      role: cu.role,
      tags: characterTags(c, curated),
      ranks: {
        pve: cu.rank,
        pvp: cu.rankPvp,
        eeBase: ee?.rank,
        eePlus10: ee?.rank10,
      },
      ...(ee
        ? {
            ee: {
              name: ee.name.en ?? '',
              passives: resolvePassives(ee.passives, 'en').map((p) => ({
                level: p.level,
                isAdd: p.isAdd,
                // `first`/`last` = valeurs reforge min/max : la discussion de
                // ranking se fait au max, comme les tooltips du site.
                text: p.last ?? p.first,
              })),
              chips: eeComparisonChips(c.id, ee.passives),
            },
          }
        : {}),
    };
  });
}
