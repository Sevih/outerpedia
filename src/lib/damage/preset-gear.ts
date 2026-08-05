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
