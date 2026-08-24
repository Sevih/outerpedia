/**
 * Résolution d'un ÉQUIPEMENT du calculateur (slugs `w`/`m`/`t` de l'état
 * `?z=`) — slug de famille wiki → groupes d'options UNIQUES des tables damage
 * (`equipment.json`), par la MÊME jointure que le wrapper serveur : famille
 * (display) → membres (`ItemTemplet` ids) → pièces damage → uniqueOptionGroups.
 * Les familles à VARIANTES PAR CLASSE (Briareos/Gorgon) choisissent le membre
 * de la classe du porteur.
 *
 * PAS exporté du barrel `src/lib/damage/index.ts` : les familles display
 * viennent des tables serveur — module node/serveur UNIQUEMENT (le rejeu des
 * fixtures et le wrapper l'utilisent ; le client passe par les props).
 */

import damageEquipment from '@data/generated/damage/equipment.json';
import poolsData from '@data/generated/equipment/pools.json';
import talismanRawData from '@data/generated/equipment/talisman.json';
import { getCharacter } from '@/lib/data/characters';
import {
  getAmuletFamilies,
  getTalismanFamilies,
  getWeaponFamilies,
  type GearFamily,
} from '@/lib/data/equipment';
import type { DamageEquipmentData } from './inputs';

const EQUIPMENT = damageEquipment as unknown as DamageEquipmentData;

/** Groupes d'options uniques (damage) d'un ensemble de membres de famille. */
export function uniqueGroupsOf(memberIds: string[]): string[] {
  const groups = new Set<string>();
  for (const id of memberIds) {
    for (const g of EQUIPMENT.pieces[id]?.uniqueOptionGroups ?? []) groups.add(g);
  }
  return [...groups];
}

/** Membres pertinents d'une famille pour un porteur : la variante de SA classe
 *  quand la famille en a (Briareos/Gorgon), toute la famille sinon. */
export function familyMembersFor(family: GearFamily, attackerClass?: string): string[] {
  if (family.classPassives && attackerClass) {
    const v = family.classPassives.find((cp) => cp.classLimit === attackerClass);
    if (v) return [v.id];
  }
  return family.ids;
}

const FAMILIES_BY_KIND = {
  weapon: getWeaponFamilies,
  amulet: getAmuletFamilies,
  talisman: getTalismanFamilies,
} as const;

/**
 * Resolver `ScenarioBuildOptions.resolveGear` côté node/serveur. `undefined`
 * si le slug ne se résout pas — jamais de groupes plausibles.
 */
export function resolveGearGroups(
  kind: 'weapon' | 'amulet' | 'talisman',
  slug: string,
  attackerId: string,
): { groups: string[] } | undefined {
  const family = FAMILIES_BY_KIND[kind]().find(
    (f) => f.slug === slug || f.classPassives?.some((cp) => cp.slug === slug),
  );
  if (!family) return undefined;
  const cls = getCharacter(attackerId)?.class;
  const groups = uniqueGroupsOf(familyMembersFor(family, cls));
  return groups.length ? { groups } : undefined;
}

// ── Main stat de TALISMAN (buff d'ÉQUIPE `BID_ITEM_STAT_OOPARTS_*`, § 15) ───

/**
 * Token de la clé de buff du jeu (`BID_ITEM_STAT_OOPARTS_<STAT>_<palier>`,
 * stable) → slug du glossaire des noms de stats. La main du talisman de
 * chaque membre est un buff d'ÉQUIPE `BT_STAT_PREMIUM` `MY_TEAM` (constat
 * 24/08/2026) — entrée du moteur pour le porteur comme pour les alliés.
 */
export const TALIS_STAT_SLUG: Record<string, string> = {
  ATK: 'atk',
  DEF: 'def',
  HP: 'hp',
  CRI: 'critical_rate',
  CRI_DMG: 'critical_dmg_rate',
  DMG_REDUCE: 'dmg_reduce_rate',
  DMG: 'dmg_boost',
  BUFF_CHANCE: 'buff_chance',
  BUF_RESIST: 'buff_resist',
};

interface TalisPoolRow {
  buff?: string;
}
const POOLS = poolsData as unknown as Record<string, TalisPoolRow[]>;
const TALISMAN_RAW = talismanRawData as unknown as Record<string, { options?: string[] }>;

/**
 * Main stats de talisman RÉELLES (union des pools, mêmes 9 stats à tous les
 * paliers) : slug de stat → buffId du palier le PLUS HAUT trouvé (suffixe de
 * rareté du BID — seul le 6★ porte les 11 niveaux d'enchant L1..L11).
 */
export function talismanMainBuffs(): { key: string; buffId: string }[] {
  const best = new Map<string, { tier: number; buffId: string }>();
  for (const tal of Object.values(TALISMAN_RAW))
    for (const ref of tal.options ?? [])
      for (const row of POOLS[ref] ?? []) {
        const m = /^BID_ITEM_STAT_OOPARTS_(.+)_(\d+)$/.exec(row.buff ?? '');
        const slug = m ? TALIS_STAT_SLUG[m[1]] : undefined;
        if (!slug || !m || !row.buff) continue;
        const tier = Number(m[2]);
        const prev = best.get(slug);
        if (!prev || tier > prev.tier) best.set(slug, { tier, buffId: row.buff });
      }
  return [...best.entries()].map(([key, v]) => ({ key, buffId: v.buffId }));
}

/** Resolver `ScenarioBuildOptions.resolveTalismanMain` côté node/serveur. */
export function resolveTalismanMainBuff(slug: string): { buffId: string } | undefined {
  const hit = talismanMainBuffs().find((m) => m.key === slug);
  return hit ? { buffId: hit.buffId } : undefined;
}
