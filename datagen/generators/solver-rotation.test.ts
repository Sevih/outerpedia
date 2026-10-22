/**
 * Rotation par tour (solver-rotation.ts) sur des kits SYNTHÉTIQUES — sans
 * `.gamedata` (contrainte CI). Ce qu'on verrouille : la sémantique des
 * cooldowns prouvée dans le client (compteur à `StartCool`, +1 au début du
 * tour, prêt à `Cool`, 0 au lancer → un `Cool` C revient à t + C), le choix
 * du plus fort parmi les prêts, la période sans le préambule, S1 seul,
 * `Cool` 0, `approx` pour une chaîne irrésolue jouée.
 */
import { describe, expect, it } from 'vitest';
import type { DamageCharacter, DamageSkill } from '../damage/characters';
import type { BestSkillSlot } from './solver-best-skill';
import { rotationOf } from './solver-rotation';

/** Un skill à un niveau, une chaîne d'un hit à 1000 ‰ : facteur = `damageFactor`. */
function skill(
  id: string,
  type: string,
  damageFactor: number,
  cool = 0,
  extra: Partial<DamageSkill> = {},
): DamageSkill {
  return {
    id,
    type,
    subType: 'ACTIVE',
    targetTeamType: 'ENEMY',
    rangeType: 'SINGLE',
    levels: [{ level: 1, damageFactor, wgReduce: 0, buffIds: [], cool, startCool: cool }],
    hits: [
      {
        id: `X_Skill_${id}_1`,
        chain: `X_Skill_${id}`,
        hit: 1,
        damageFactor: 1000,
        damageType: 'DT_CUT',
        multiHit: false,
        maxHitCount: 0,
        isAdditive: false,
      },
    ],
    ...extra,
  };
}

function char(ids: string[]): Pick<DamageCharacter, 'skills'> {
  return { skills: ids.map((id, i) => ({ slot: i + 1, id })) };
}

function run(skills: Record<string, DamageSkill>, n: number) {
  const turns: BestSkillSlot[] = new Array<BestSkillSlot>(n);
  const rotation = rotationOf(char(Object.keys(skills)), skills, turns);
  return { rotation, turns };
}

describe('rotationOf — rotation par tour pondérée par les cooldowns', () => {
  it('Tamamo-no-Mae (2000086) : S1 1500 / S2 1880 cool 3 / S3 2490 cool 4', () => {
    const { rotation, turns } = run(
      {
        1: skill('1', 'SKT_FIRST', 1500),
        2: skill('2', 'SKT_SECOND', 1880, 3),
        3: skill('3', 'SKT_ULTIMATE', 2490, 4),
      },
      12,
    );
    // Compteurs (S2/S3) après la montée du début de tour, puis le choix :
    //  t1 3/4 S3 · t2 3/1 S2 · t3 1/2 S1 · t4 2/3 S1 · t5 3/4 S3 (= t1) …
    // Le S3 lancé au tour 1 revient au tour 5 (t + Cool), le S2 du tour 2
    // reviendrait au tour 5 mais le S3 passe devant : il glisse au tour 6.
    expect(turns).toEqual(['S3', 'S2', 'S1', 'S1', 'S3', 'S2', 'S1', 'S1', 'S3', 'S2', 'S1', 'S1']);
    // (2490 + 1880 + 1500 + 1500) / 4 = 1842,5 → 1843.
    expect(rotation).toEqual({ factorPerTurn: 1843, cycle: 4, uses: { S1: 2, S2: 1, S3: 1 } });
  });

  it('la période exclut le préambule du tour 1 (S2 cool 2 / S3 cool 4)', () => {
    const { rotation, turns } = run(
      {
        1: skill('1', 'SKT_FIRST', 1000),
        2: skill('2', 'SKT_SECOND', 1500, 2),
        3: skill('3', 'SKT_ULTIMATE', 2000, 4),
      },
      9,
    );
    // t1 2/4 S3 · t2 2/1 S2 · t3 1/2 S1 · t4 2/3 S2 · t5 1/4 S3 · t6 2/1 (= t2) …
    expect(turns).toEqual(['S3', 'S2', 'S1', 'S2', 'S3', 'S2', 'S1', 'S2', 'S3']);
    // Période t2..t5 : (1500 + 1000 + 1500 + 2000) / 4 = 1500.
    expect(rotation).toEqual({ factorPerTurn: 1500, cycle: 4, uses: { S1: 1, S2: 2, S3: 1 } });
  });

  it('pas de S2/S3 offensif (soin, buff) → S1 seul, à chaque tour', () => {
    const { rotation, turns } = run(
      {
        1: skill('1', 'SKT_FIRST', 1600),
        2: skill('2', 'SKT_SECOND', 0, 3),
        3: skill('3', 'SKT_ULTIMATE', 0, 4),
      },
      4,
    );
    expect(turns).toEqual(['S1', 'S1', 'S1', 'S1']);
    expect(rotation).toEqual({ factorPerTurn: 1600, cycle: 1, uses: { S1: 1, S2: 0, S3: 0 } });
  });

  it('cool 0 → le plus fort à chaque tour', () => {
    const { rotation, turns } = run(
      {
        1: skill('1', 'SKT_FIRST', 1500),
        2: skill('2', 'SKT_SECOND', 1880, 0),
        3: skill('3', 'SKT_ULTIMATE', 2490, 0),
      },
      3,
    );
    expect(turns).toEqual(['S3', 'S3', 'S3']);
    expect(rotation).toEqual({ factorPerTurn: 2490, cycle: 1, uses: { S1: 0, S2: 0, S3: 1 } });
  });

  it('un skill joué à chaîne irrésolue compte 1000 ‰ de hits et pose approx', () => {
    const S3u = skill('3', 'SKT_ULTIMATE', 2400, 2, { hits: [], hitsUnresolved: true });
    const { rotation } = run({ 1: skill('1', 'SKT_FIRST', 1200), 3: S3u }, 2);
    // Tours S3 S1 en boucle : (2400 + 1200) / 2.
    expect(rotation).toEqual({
      factorPerTurn: 1800,
      cycle: 2,
      uses: { S1: 1, S2: 0, S3: 1 },
      approx: true,
    });
  });

  it('kit sans dégâts (ou skills inconnus) → undefined, comme bestSkill', () => {
    expect(rotationOf(char(['2']), { 2: skill('2', 'SKT_SECOND', 0, 3) })).toBeUndefined();
    expect(rotationOf(char(['404']), {})).toBeUndefined();
  });
});
