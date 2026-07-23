/**
 * Tests du générateur towers — les DEUX registres actés (TODO 17/07) :
 *
 *   1. CŒUR PUR en synthétique : `formationOf` (les 4 slots `ID0..3`, chacun un
 *      CSV possible dont les monstres partagent le `Level` du slot) — le seul
 *      bout de logique du générateur qui ne touche aucune table.
 *
 *   2. INVARIANTS RÉFÉRENTIELS sur `data/generated/towers.json` committé
 *      (modèle encounters/singularity) : chaque étage pointe un donjon extrait,
 *      chaque monstre existe, la composition est waves XOR encounters, les
 *      étages randomisés (very hard) ne figent rien. Une dérive rendrait une
 *      tour vide ou une composition fausse sans symptôme.
 *
 * La suite tourne SANS `.gamedata` (contrainte CI) : rien ici n'appelle
 * `buildTowers()` ni `loadTable`.
 */
import { describe, expect, it } from 'vitest';
import towersData from '../../data/generated/towers.json';
import encountersData from '../../data/generated/encounters.json';
import monstersData from '../../data/generated/monsters.json';
import type { Row } from '../lib/tables';
import { formationOf, type TowersData } from './towers';

// ─── 1. Cœur pur (synthétique) ───────────────────────────────────────────────

describe('formationOf — slots ID0..3 → unités', () => {
  it('lit les 4 slots, chacun avec son niveau', () => {
    const w: Row = { ID0: 'm1', Level0: '80', ID1: 'm2', Level1: '82' };
    expect(formationOf(w)).toEqual([
      { id: 'm1', level: 80 },
      { id: 'm2', level: 82 },
    ]);
  });

  it('un slot CSV : plusieurs monstres PARTAGENT le Level du slot', () => {
    const w: Row = { ID0: 'a, b', Level0: '75' };
    expect(formationOf(w)).toEqual([
      { id: 'a', level: 75 },
      { id: 'b', level: 75 },
    ]);
  });

  it('slots vides ignorés, niveau absent → 0', () => {
    const w: Row = { ID0: 'x', ID2: 'y' };
    expect(formationOf(w)).toEqual([
      { id: 'x', level: 0 },
      { id: 'y', level: 0 },
    ]);
  });
});

// ─── 2. Invariants sur la donnée committée ───────────────────────────────────

const towers = towersData as unknown as TowersData;
const dungeonIds = new Set(Object.keys(encountersData as Record<string, unknown>));
const monsterIds = new Set(Object.keys(monstersData as Record<string, unknown>));
const towerEntries = Object.entries(towers);

describe('towers.json — structure des tours', () => {
  it('des tours existent, chaque mode est un slug « tower* »', () => {
    expect(towerEntries.length).toBeGreaterThan(0);
    const bad = towerEntries.filter(([, t]) => !t.mode.startsWith('tower')).map(([k]) => k);
    expect(bad).toEqual([]);
  });

  it('étages : triés, numéros uniques, dungeon extrait, composition waves XOR encounters', () => {
    const bad: string[] = [];
    for (const [key, t] of towerEntries) {
      if (!t.floors.length) bad.push(`${key} : 0 étage`);
      let prev = -Infinity;
      const nums = new Set<number>();
      for (const f of t.floors) {
        if (f.floor < prev) bad.push(`${key} : étages non triés (${f.floor} après ${prev})`);
        prev = f.floor;
        if (nums.has(f.floor)) bad.push(`${key} : étage ${f.floor} en double`);
        nums.add(f.floor);
        if (!dungeonIds.has(f.dungeon)) bad.push(`${key}/${f.floor} : donjon ${f.dungeon} absent`);
        const hasWaves = !!f.waves?.length;
        const hasEnc = !!f.encounters?.length;
        if (hasWaves === hasEnc) bad.push(`${key}/${f.floor} : waves=${hasWaves} enc=${hasEnc}`);
        if (!Array.isArray(f.restrictions)) bad.push(`${key}/${f.floor} : restrictions non-array`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('chaque monstre d’une formation existe dans monsters.json', () => {
    const orphans: string[] = [];
    for (const [key, t] of towerEntries) {
      for (const f of t.floors) {
        for (const grp of [...(f.waves ?? []), ...(f.encounters ?? [])]) {
          for (const u of grp)
            if (!monsterIds.has(u.id)) orphans.push(`${key}/${f.floor} → ${u.id}`);
        }
      }
    }
    expect(orphans).toEqual([]);
  });
});

describe('towers.json — restrictions randomisées (very hard)', () => {
  it('un étage `randomized` ne fige AUCUNE restriction (le menu vit dans le pool)', () => {
    const bad: string[] = [];
    for (const [key, t] of towerEntries) {
      for (const f of t.floors) {
        if (f.randomized && f.restrictions.length) bad.push(`${key}/${f.floor}`);
      }
      // Si un étage est randomisé, la tour doit exposer le menu dédupliqué.
      if (t.floors.some((f) => f.randomized) && !t.restrictionsPool?.length)
        bad.push(`${key} : étages randomisés sans restrictionsPool`);
    }
    expect(bad).toEqual([]);
  });

  it('restrictionsPool dédupliqué par type|subType|count', () => {
    const bad: string[] = [];
    for (const [key, t] of towerEntries) {
      if (!t.restrictionsPool) continue;
      const keys = t.restrictionsPool.map((r) => `${r.type}|${r.subType}|${r.count}`);
      if (new Set(keys).size !== keys.length) bad.push(key);
    }
    expect(bad).toEqual([]);
  });
});
