import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { rankBadgeSprite } from '@/lib/ranks';
import type { EncountersFile } from '@contracts';

const encounters = JSON.parse(
  readFileSync(resolve(process.cwd(), 'data/generated/encounters.json'), 'utf8'),
) as EncountersFile;

/** Tous les noms de palier RÉELS, tous modes confondus. */
const rankNames = [
  ...new Set(
    Object.values(encounters).flatMap((d) => (d.ranks ?? []).map((r) => r.name).filter(Boolean)),
  ),
] as string[];

describe('rankBadgeSprite — badge de palier', () => {
  it('dérive base / + / ++', () => {
    expect(rankBadgeSprite('E')).toBe('CM_Event_Rank_E');
    expect(rankBadgeSprite('E+')).toBe('CM_Event_Rank_E_01');
    expect(rankBadgeSprite('E++')).toBe('CM_Event_Rank_E_02');
    expect(rankBadgeSprite('SSS++')).toBe('CM_Event_Rank_SSS_02');
    expect(rankBadgeSprite('AAA+')).toBe('CM_Event_Rank_AAA_01');
  });

  /**
   * Le garde-fou qui compte : un palier ajouté par un patch et dont le sprite
   * n'existe pas produirait une image cassée, en silence, sur chaque guide de
   * boss. Le manifest d'assets collecte EXACTEMENT ces sprites — donc si ce
   * test passe, la collecte est complète, et inversement.
   */
  it('chaque palier réel de la donnée produit un sprite de la forme attendue', () => {
    expect(rankNames.length).toBeGreaterThan(0);
    for (const name of rankNames) {
      expect(rankBadgeSprite(name), name).toMatch(
        /^CM_Event_Rank_(E|D|C|B|A|AA|AAA|S|SS|SSS)(_0[12])?$/,
      );
    }
  });
});
