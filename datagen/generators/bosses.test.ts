/**
 * Invariants du générateur bosses sur `data/generated/equipment/bosses.json`
 * committé : les boss référencés par l'éditorial/les sources d'équipement,
 * résolus (nom, portrait, élément, titre du contenu). Table-based, pas de cœur
 * pur → invariants seuls.
 *
 * Cross-ref clé : chaque boss d'une source d'équipement DOIT être résolu ici
 * (sinon la fiche équipement rend un portrait sans nom). Tourne SANS `.gamedata`.
 */
import { describe, expect, it } from 'vitest';
import bossesData from '../../data/generated/equipment/bosses.json';
import monstersData from '../../data/generated/monsters.json';
import sourcesData from '../../data/generated/equipment/sources.json';
import type { Boss } from './bosses';
import type { ItemSources } from './sources';

const bosses = bossesData as unknown as Record<string, Boss>;
const monsterIds = new Set(Object.keys(monstersData as Record<string, unknown>));
const sources = sourcesData as unknown as ItemSources;
const ELEMENTS = new Set(['fire', 'water', 'earth', 'light', 'dark']);

describe('bosses.json — invariants', () => {
  it('chaque boss : nommé, portrait, élément connu, id ∈ monsters.json', () => {
    expect(Object.keys(bosses).length).toBeGreaterThan(0);
    const bad: string[] = [];
    for (const [id, b] of Object.entries(bosses)) {
      if (!b.name?.en) bad.push(`${id} : sans nom`);
      if (!b.icon) bad.push(`${id} : sans portrait`);
      if (!ELEMENTS.has(b.element)) bad.push(`${id} : élément « ${b.element} »`);
      if (!monsterIds.has(id)) bad.push(`${id} : absent de monsters.json`);
    }
    expect(bad).toEqual([]);
  });

  it('chaque boss d’une source d’équipement est résolu ici', () => {
    const missing: string[] = [];
    for (const [itemId, s] of Object.entries(sources)) {
      for (const b of s.bosses) if (!bosses[b]) missing.push(`${itemId} → ${b}`);
    }
    expect(missing).toEqual([]);
  });
});
