/**
 * Tests du générateur sources (obtention des équipements) — les DEUX registres :
 *
 *   1. CŒUR PUR en synthétique : `shopSlug` (ProductBuyType → boutique). Le
 *      reste de la logique de traversée donjon→spawn→monstres est PARTAGÉE avec
 *      encounters et déjà couverte par `encounters.test` (spawnUnits,
 *      dungeonSpawnedMonsters) — pas re-testée ici.
 *
 *   2. INVARIANTS RÉFÉRENTIELS sur `data/generated/equipment/sources.json`
 *      committé : chaque item source est un équipement réel, chaque boss un
 *      monstre extrait, chaque boutique un slug connu. Une dérive rendrait un
 *      onglet « où l'obtenir » troué sans symptôme.
 *
 * La suite tourne SANS `.gamedata` (contrainte CI) : rien ici n'appelle
 * `buildItemSources()` ni `loadTable`.
 */
import { describe, expect, it } from 'vitest';
import sourcesData from '../../data/generated/equipment/sources.json';
import weaponData from '../../data/generated/equipment/weapon.json';
import accessoryData from '../../data/generated/equipment/accessory.json';
import helmetData from '../../data/generated/equipment/helmet.json';
import armorData from '../../data/generated/equipment/armor.json';
import glovesData from '../../data/generated/equipment/gloves.json';
import shoesData from '../../data/generated/equipment/shoes.json';
import talismanData from '../../data/generated/equipment/talisman.json';
import eeData from '../../data/generated/equipment/ee.json';
import monstersData from '../../data/generated/monsters.json';
import { shopSlug, type ItemSources } from './sources';

// ─── 1. Cœur pur (synthétique) ───────────────────────────────────────────────

describe('shopSlug — ProductBuyType → boutique', () => {
  it('licence d’aventure et pièces d’événement (avec/sans ALWAYS)', () => {
    expect(shopSlug('PBT_ADVENTURE_LICENSE')).toBe('adventure_license');
    expect(shopSlug('PBT_EVENT_COIN_1')).toBe('event_shop');
    expect(shopSlug('PBT_ALWAYS_EVENT_COIN_2')).toBe('event_shop');
  });

  it('monnaies génériques / absent → null (pas une source utile)', () => {
    expect(shopSlug('PBT_CRYSTAL')).toBeNull();
    expect(shopSlug(undefined)).toBeNull();
    expect(shopSlug('')).toBeNull();
  });
});

// ─── 2. Invariants sur la donnée committée ───────────────────────────────────

const sources = sourcesData as unknown as ItemSources;
const monsterIds = new Set(Object.keys(monstersData as Record<string, unknown>));
const equipmentIds = new Set(
  [
    weaponData,
    accessoryData,
    helmetData,
    armorData,
    glovesData,
    shoesData,
    talismanData,
    eeData,
  ].flatMap((t) => Object.keys(t as Record<string, unknown>)),
);
const VALID_SHOPS = new Set(['adventure_license', 'event_shop']);
const entries = Object.entries(sources);

describe('sources.json — invariants référentiels', () => {
  it('des sources existent, chaque item est un équipement réel', () => {
    expect(entries.length).toBeGreaterThan(0);
    const orphans = entries.filter(([id]) => !equipmentIds.has(id)).map(([id]) => id);
    expect(orphans).toEqual([]);
  });

  it('chaque boss est un monstre extrait, triés/dédupliqués', () => {
    const bad: string[] = [];
    for (const [id, s] of entries) {
      for (const b of s.bosses) if (!monsterIds.has(b)) bad.push(`${id} → ${b}`);
      if ([...s.bosses].sort().join() !== s.bosses.join()) bad.push(`${id} : bosses non triés`);
      if (new Set(s.bosses).size !== s.bosses.length) bad.push(`${id} : bosses en double`);
    }
    expect(bad).toEqual([]);
  });

  it('chaque boutique est un slug connu ; une entrée a au moins une source', () => {
    const bad: string[] = [];
    for (const [id, s] of entries) {
      for (const sh of s.shops ?? []) if (!VALID_SHOPS.has(sh)) bad.push(`${id} : shop « ${sh} »`);
      if (!s.bosses.length && !s.shops?.length) bad.push(`${id} : ni boss ni boutique`);
    }
    expect(bad).toEqual([]);
  });
});
