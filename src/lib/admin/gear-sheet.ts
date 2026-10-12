/**
 * La FICHE d'une entité d'équipement depuis l'extraction FRAÎCHE — ce que
 * `GearDetail` de l'admin lisait du COMMITTÉ (`@/lib/data/equipment`), relu
 * ici du build de la cible (`buildEquipment`) : une famille d'armes, d'amulettes
 * ou de talismans (l'unité de la sidebar et du catalogue public), un EE, un
 * set. Un équipement `new` a donc sa fiche avant d'être intégré, ce que
 * l'admin ne savait pas faire.
 *
 * Et le PONT entre la cible de revue (`weapon`, `amulet`…), le kind
 * d'intégration (`weapon`, `accessory`…), le slot du build et la clé de
 * famille — la table `INTEGRATE` de `GearDetail`, sortie du composant.
 *
 * PUR : le build est passé, rien n'est lu ici.
 */
import type {
  Family,
  GearItem,
  LangDict,
  Passive,
  PassiveRef,
  SetEffect,
  SpecialItem,
} from '@contracts';
import type { EquipmentData } from '@datagen/generators/equipment';
import type { EquipmentEntityKind } from '@/lib/admin/review-types';
import { fillPlaceholders, optionStatLabel } from '@/lib/data/equipment';

/** Les cibles de revue qui ont une fiche d'équipement (les armures n'en ont pas). */
export type GearTarget = 'ee' | 'weapon' | 'amulet' | 'talisman' | 'set';

export interface GearTargetInfo {
  /** Le kind d'intégration (`integrateEquipment`) — accessoire pour les amulettes. */
  kind: EquipmentEntityKind;
  /** Le slot du build (`EquipmentData`). */
  slot: 'ee' | 'weapon' | 'accessory' | 'talisman' | 'sets';
  /** La clé de `families` ; `null` pour un EE ou un set (un seul id). */
  familyKey: 'weapon' | 'accessory' | 'talisman' | null;
  /** Le segment de la page de l'admin (`/admin/extractor/<segment>/<id>`). */
  adminPath: string;
}

/** Cible de revue → kind d'intégration, slot, famille, page de l'admin. */
export const GEAR_TARGETS: Readonly<Record<GearTarget, GearTargetInfo>> = {
  ee: { kind: 'ee', slot: 'ee', familyKey: null, adminPath: 'ee' },
  weapon: { kind: 'weapon', slot: 'weapon', familyKey: 'weapon', adminPath: 'weapons' },
  amulet: { kind: 'accessory', slot: 'accessory', familyKey: 'accessory', adminPath: 'amulets' },
  talisman: { kind: 'talisman', slot: 'talisman', familyKey: 'talisman', adminPath: 'talismans' },
  set: { kind: 'set', slot: 'sets', familyKey: null, adminPath: 'sets' },
};

export const isGearTarget = (id: string): id is GearTarget => id in GEAR_TARGETS;

/** Un palier de passif, résolu : son texte au premier et au dernier palier de valeurs. */
export interface GearPassiveView {
  level: number;
  isAdd: boolean;
  name: string;
  icon: string;
  first: string;
  last?: string;
  levels: number;
}

/** Une variante de classe d'une famille dont les passifs diffèrent (Briareos/Gorgon). */
export interface GearClassVariantView {
  classLimit: string;
  id: string;
  icon: string;
  mainStats: string[];
  passives: GearPassiveView[];
}

export interface GearSheet {
  kind: 'family' | 'ee' | 'set';
  /** La clé que l'intégration prend : l'id de la famille, ou celui de l'EE ou du set. */
  id: string;
  name: LangDict;
  icon: string;
  grade: string;
  /** Les paliers d'étoiles de la famille ; l'étoile de l'EE. */
  stars: number[];
  classLimits: string[];
  /** Talisman : le type de points de son passif. */
  mode?: 'AP' | 'CP';
  mainStats: string[];
  passives: GearPassiveView[];
  classVariants?: GearClassVariantView[];
  /** Les effets structurés des passifs, « famille/catégorie stat ». */
  effects: string[];
  /** Les membres de la famille (un pour un EE ou un set). */
  members: string[];
  /** EE : le perso porteur et la confiance requise. */
  characterId?: string;
  trustLevel?: number;
  /** Set : l'icône de la meilleure pièce par slot, et les bonus par palier. */
  pieces?: { slot: string; icon: string }[];
  tiers?: { p2?: string; p4?: string }[];
}

/** Les mains d'un lot de pools, dédoublonnées (la règle de `mainStatsOf`). */
function mainStatsOf(
  groups: string[],
  pools: EquipmentData['pools'],
  excludeFlatBase: boolean,
): string[] {
  const out: string[] = [];
  for (const g of groups)
    for (const o of pools[g] ?? []) {
      if (excludeFlatBase && o.mode === 'flat' && ['atk', 'def', 'hp'].includes(o.stat)) continue;
      const label = optionStatLabel(o);
      if (label && !out.includes(label)) out.push(label);
    }
  return out;
}

/** Seuls les pools ROULÉS disent ce qu'un objet peut porter (la règle de `materializeFamilies`). */
function rolledGroups(memberGroups: string[][], pools: EquipmentData['pools']): string[] {
  const rolled = memberGroups.filter((gs) => gs.some((g) => (pools[g] ?? []).length > 1));
  return (rolled.length ? rolled : memberGroups).flat();
}

/** Les paliers de passif d'un item, résolus sur le catalogue frais (`resolvePassives`, en anglais). */
export function resolveFreshPassives(
  refs: PassiveRef[],
  passives: Record<string, Passive | undefined>,
): GearPassiveView[] {
  const out: GearPassiveView[] = [];
  for (const ref of refs) {
    const p = passives[ref.id];
    if (!p) continue;
    const desc = p.desc.en;
    const first = p.values.length ? fillPlaceholders(desc, p.values[0]) : desc;
    const last =
      p.values.length > 1 ? fillPlaceholders(desc, p.values[p.values.length - 1]) : undefined;
    out.push({
      level: ref.level,
      isAdd: ref.isAdd,
      name: p.name.en,
      icon: p.icon,
      first,
      ...(last ? { last } : {}),
      levels: p.values.length,
    });
  }
  return out;
}

const passiveEffects = (refs: PassiveRef[], passives: Record<string, Passive | undefined>) =>
  refs
    .flatMap((ref) => passives[ref.id]?.effects ?? [])
    .map((e) => `${e.family}/${e.category}${e.stat ? ` ${e.stat}` : ''}`);

/** Le texte d'un bonus de set : le nom OFFICIEL de la stat, ou la description officielle. */
function setEffectText(
  e: SetEffect | null,
  statNames: EquipmentData['statNames'],
): string | undefined {
  if (!e) return undefined;
  if (e.stat) return `${statNames[e.stat]?.en ?? e.stat} +${e.value}`;
  return e.desc?.en || undefined;
}

const ARMOR_SLOTS = ['helmet', 'armor', 'gloves', 'shoes'] as const;
const GRADE_RANK: Record<string, number> = { normal: 0, magic: 1, rare: 2, unique: 3 };

/** La famille d'un id : celle dont il est l'id canonique, sinon celle qui le compte parmi ses membres. */
export function familyOf(families: Family[], id: string): Family | undefined {
  return families.find((f) => f.id === id) ?? families.find((f) => f.ids.includes(id));
}

/**
 * La fiche d'une entité de la cible `target`, par sa clé — l'id d'un membre
 * suffit pour une famille (la revue est keyée par item, la fiche par famille).
 * `undefined` si l'extraction fraîche ne la connaît pas.
 */
export function gearSheet(
  fresh: EquipmentData,
  target: GearTarget,
  key: string,
): GearSheet | undefined {
  const { slot, familyKey } = GEAR_TARGETS[target];
  const pools = fresh.pools;
  const passives = fresh.passives;

  if (familyKey) {
    const table = fresh[slot] as Record<string, GearItem | SpecialItem | undefined>;
    const family = familyOf(fresh.families[familyKey], key);
    const top = family && table[family.topId];
    if (!family || !top) return undefined;
    const excludeFlatBase = target === 'weapon';
    const groupsOf = (m: GearItem | SpecialItem): string[] => ('options' in m ? m.options : m.main);
    const topIds = family.ids.filter((id) => table[id]?.star === top.star);
    const members = topIds
      .map((id) => table[id])
      .filter((m): m is GearItem | SpecialItem => Boolean(m));
    // Les variantes PAR CLASSE, quand leurs passifs diffèrent (la règle de la famille publique).
    const byClass = new Map<
      string,
      { id: string; m: GearItem | SpecialItem; groups: string[][] }
    >();
    for (const id of topIds) {
      const m = table[id];
      const cl = m && 'classLimit' in m ? (m.classLimit ?? '') : '';
      if (!m || !cl) continue;
      const e = byClass.get(cl);
      if (e) {
        e.groups.push(groupsOf(m));
        if (Number(id) < Number(e.id)) e.id = id;
      } else byClass.set(cl, { id, m, groups: [groupsOf(m)] });
    }
    const sig = (ps: PassiveRef[]) => ps.map((p) => p.id).join(',');
    const classVariants =
      byClass.size > 1 && new Set([...byClass.values()].map((v) => sig(v.m.passives))).size > 1
        ? [...byClass].map(([classLimit, v]): GearClassVariantView => ({
            classLimit,
            id: v.id,
            icon: v.m.icon,
            mainStats: mainStatsOf(rolledGroups(v.groups, pools), pools, excludeFlatBase),
            passives: resolveFreshPassives(v.m.passives, passives),
          }))
        : undefined;
    return {
      kind: 'family',
      id: family.id,
      name: top.name,
      icon: top.icon,
      grade: top.grade,
      stars: family.stars,
      classLimits: family.classLimits,
      ...('mode' in top && top.mode ? { mode: top.mode } : {}),
      mainStats: mainStatsOf(rolledGroups(members.map(groupsOf), pools), pools, excludeFlatBase),
      passives: resolveFreshPassives(top.passives, passives),
      ...(classVariants ? { classVariants } : {}),
      effects: passiveEffects(top.passives, passives),
      members: family.ids,
    };
  }

  if (target === 'ee') {
    const e = fresh.ee[key];
    if (!e) return undefined;
    return {
      kind: 'ee',
      id: key,
      name: e.name,
      icon: e.icon,
      grade: e.grade,
      stars: [e.star],
      classLimits: [],
      // Le 2e slot d'un EE est une option spéciale (stat interne + buff) : son
      // texte vient du passif — on ne garde que les stats connues.
      mainStats: mainStatsOf(e.options, pools, false).filter((l) => !l.includes('_')),
      passives: resolveFreshPassives(e.passives, passives),
      effects: passiveEffects(e.passives, passives),
      members: [key],
      characterId: e.character,
      trustLevel: e.trustLevel,
    };
  }

  const s = fresh.sets[key];
  if (!s) return undefined;
  const pieces: { slot: string; icon: string }[] = [];
  for (const slotName of ARMOR_SLOTS) {
    // La meilleure pièce = le grade le plus haut PUIS les étoiles (les grades
    // bas référencent aussi le set).
    let best: { icon: string; rank: number } | undefined;
    for (const piece of Object.values(fresh[slotName])) {
      if (piece.set !== key) continue;
      const rank = (GRADE_RANK[piece.grade] ?? 0) * 10 + piece.star;
      if (!best || rank > best.rank) best = { icon: piece.icon, rank };
    }
    if (best) pieces.push({ slot: slotName, icon: best.icon });
  }
  return {
    kind: 'set',
    id: key,
    name: s.name,
    icon: s.icon,
    grade: 'unique',
    stars: [],
    classLimits: [],
    mainStats: [],
    passives: [],
    effects: [],
    members: [key],
    pieces,
    tiers: s.tiers.map((t) => {
      const p2 = setEffectText(t['2p'], fresh.statNames);
      const p4 = setEffectText(t['4p'], fresh.statNames);
      return { ...(p2 ? { p2 } : {}), ...(p4 ? { p4 } : {}) };
    }),
  };
}
