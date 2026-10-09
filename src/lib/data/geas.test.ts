import { describe, expect, it } from 'vitest';
import glossariesData from '@data/generated/glossaries.json';
import type { Glossaries } from '@contracts';
import { getEncounters } from '@/lib/data/encounters';
import { getGeas, geasUnlockTable, isBonusGeas, resolveGeas } from '@/lib/data/geas';

/**
 * Les geas sont DÉRIVÉS, jamais recopiés : le pool vit dans `glossaries.geas`,
 * la table de déblocage d'un sous-boss se lit sur les `geasRewards` de ses
 * stages. Deux dérives silencieuses possibles : un id de geas qui ne résout
 * plus (palier muet) et un classement bonus/malus faux (le SIGNE de `points`
 * fait foi, pas le flag `positive` du jeu). Le groupe d'ancrage n'est pas
 * écrit en dur : c'est le premier sous-boss de raid de guilde qui porte des
 * geas dans la donnée committée — une saison purgée par un patch ne casse rien.
 */

const POOL = (glossariesData as unknown as Glossaries).geas ?? {};
const GROUP = [
  ...new Set(
    Object.values(getEncounters())
      .map((d) => d.group)
      .filter((g): g is string => Boolean(g?.startsWith('guild_raid:'))),
  ),
].find((g) => geasUnlockTable(g).length > 0);

describe('pool de geas (glossaries.geas)', () => {
  it('un pool non vide, chaque entrée complète', () => {
    const entries = Object.entries(POOL);
    expect(entries.length).toBeGreaterThan(0);
    for (const [id, g] of entries) {
      expect(g.desc.en, id).toBeTruthy();
      expect(typeof g.points, id).toBe('number');
      expect(g.icon, id).toBeTruthy();
    }
  });

  it('getGeas : résout par id et conserve l’id (clés React)', () => {
    const id = Object.keys(POOL)[0];
    expect(getGeas(id)).toEqual({ id, geas: POOL[id] });
    expect(getGeas('id-inconnu')).toBeUndefined();
  });

  it('resolveGeas : ignore les ids inconnus, préserve l’ordre', () => {
    const [a, b] = Object.keys(POOL);
    const refs = resolveGeas([b, 'fantôme', a]);
    expect(refs.map((r) => r.id)).toEqual([b, a]);
  });
});

describe('isBonusGeas — le signe de points fait foi', () => {
  it('points > 0 → bonus ; points < 0 → malus ; 0 → bonus (pas de rouge)', () => {
    const geas = (points: number) => ({ ...POOL[Object.keys(POOL)[0]], points });
    expect(isBonusGeas(geas(120))).toBe(true);
    expect(isBonusGeas(geas(-80))).toBe(false);
    expect(isBonusGeas(geas(0))).toBe(true);
  });

  it('le pool contient bien les deux signes (sinon le split bonus/malus est mort)', () => {
    const all = Object.values(POOL);
    expect(all.some((g) => g.points > 0)).toBe(true);
    expect(all.some((g) => g.points < 0)).toBe(true);
  });
});

describe('geasUnlockTable — table de déblocage d’un sous-boss', () => {
  const table = GROUP ? geasUnlockTable(GROUP) : [];

  it('des paliers triés par kills croissants, lus des clés stage_N', () => {
    expect(GROUP, 'aucun sous-boss de raid ne porte de geas').toBeDefined();
    expect(table.length).toBeGreaterThan(0);
    const kills = table.map((u) => u.kill);
    expect([...kills].sort((a, b) => a - b)).toEqual(kills);
    expect(new Set(kills).size).toBe(kills.length);
    expect(kills[0]).toBe(1); // stage_1 = premier kill
  });

  it('chaque palier classe ses geas par le signe de points', () => {
    for (const u of table) {
      expect(u.bonus || u.malus, `palier ${u.kill}`).toBeTruthy();
      if (u.bonus) expect(u.bonus.geas.points, `palier ${u.kill}`).toBeGreaterThanOrEqual(0);
      if (u.malus) expect(u.malus.geas.points, `palier ${u.kill}`).toBeLessThan(0);
    }
  });

  it('un combat inconnu (saison purgée) rend une table VIDE, pas une erreur', () => {
    expect(geasUnlockTable('guild_raid:SYS_TITLE_FANTOME')).toEqual([]);
  });
});
