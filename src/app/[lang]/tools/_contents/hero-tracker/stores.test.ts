import { describe, expect, it } from 'vitest';
import { getCharacter, progressionStar } from '@/lib/data/characters';
import { transcendLadder } from '@/lib/transcendence';
import type { TrackerState } from './contracts';
import type { HeroProgress } from './engine';
import { trackerSpec } from './stores';

/**
 * Migration v2 → v3 du store : l'index de transcendance suit la nouvelle
 * échelle (paliers fantômes 5/7/8 des 1★/2★ retirés, fusionné d'origine 2★ sur
 * l'échelle de son origine). Branchée comme dans `useTrackerState`.
 */
const SPEC = trackerSpec((id) => {
  const c = getCharacter(id);
  return (
    c && { rarity: c.rarity, stars: transcendLadder(progressionStar(c), id).map((s) => s.star) }
  );
});

const at = (transcend: number): HeroProgress => ({
  level: 100,
  skills: [1, 1, 1, 1],
  fusion: 0,
  affinity: 1,
  transcend,
  ee: [0],
});

/** Index migré de l'état ET de la cible d'un héros saisi en v2. */
const migrate = (id: string, transcend: number): number[] => {
  const v2 = {
    ...SPEC.fallback,
    heroes: { [id]: { state: at(transcend), target: at(transcend) } },
  } satisfies TrackerState;
  const out = SPEC.migrate?.(v2, 2);
  return out ? [out.heroes[id].state.transcend, out.heroes[id].target.transcend] : [];
};

describe('store du Hero tracker — v2 → v3', () => {
  it('un 2★ : le max reste le max, un cran fantôme retombe sur le palier d’en dessous', () => {
    expect(migrate('2000003', 7)).toEqual([4, 4]); // étoile 9
    expect(migrate('2000003', 4)).toEqual([3, 3]); // étoile 6
    expect(migrate('2000003', 5)).toEqual([3, 3]); // étoile 7, fantôme → 6
    expect(migrate('2000003', 2)).toEqual([2, 2]); // étoile 4, inchangée
  });

  it('Snow fusionné : de l’échelle 3★ (3..9) à celle de son origine (3, 4, 6, 9)', () => {
    expect(migrate('2700003', 6)).toEqual([3, 3]);
    expect(migrate('2700003', 3)).toEqual([2, 2]);
  });

  it('un 3★ et Veronica fusionnée ne bougent pas', () => {
    for (let i = 0; i <= 6; i++) {
      expect(migrate('2000073', i)).toEqual([i, i]);
      expect(migrate('2700037', i)).toEqual([i, i]);
    }
  });

  it('la saisie est GARDÉE (un `undefined` la remplacerait par le fallback)', () => {
    const v2 = {
      ...SPEC.fallback,
      alwaysMax: true,
      fused: { '2000003': true },
      heroes: { '9999999': { state: at(5), target: at(6) } },
    } satisfies TrackerState;
    expect(SPEC.migrate?.(v2, 2)).toEqual(v2); // héros inconnu : passe tel quel
  });

  it('v1 est toujours relevée, et réindexée au passage', () => {
    const v1 = {
      '2000003': {
        state: { level: 50, skills: [2, 2, 2], affinity: 3, transcend: 5, ee: 1 },
        target: { level: 120, skills: [5, 5, 5], affinity: 10, transcend: 7, ee: 10 },
      },
    };
    const out = SPEC.migrate?.(v1, 1);
    expect(out?.heroes['2000003'].state).toEqual({
      level: 50,
      skills: [2, 2, 2, 1],
      fusion: 0,
      affinity: 3,
      transcend: 3,
      ee: [1],
    });
    expect(out?.heroes['2000003'].target.transcend).toBe(4);
  });
});
