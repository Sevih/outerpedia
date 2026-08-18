/**
 * Amont pur (contrat debugState → entrées moteur) — rejoué sur les VRAIS
 * artefacts committés (`data/generated/damage/*.json`), comme le fera le test
 * des fixtures (harnais § 4). Les attendus sont des PROPRIÉTÉS dérivées des
 * primitives du moteur (identité § 16.1, catalogue FX sourcé) — jamais des
 * nombres recopiés d'un rendu.
 */
import { describe, expect, it } from 'vitest';
import charactersData from '../../../data/generated/damage/characters.json';
import growthData from '../../../data/generated/damage/growth.json';
import buffsData from '../../../data/generated/damage/buffs.json';
import { calcBaseStat } from './formula';
import {
  buildCombatStats,
  buildDamageReport,
  dungeonModeOf,
  elementOf,
  eventMaxHpRate,
  modifierAfter100For,
  resolveFx,
  trustBuffs,
  type AttackerBuildInput,
  type DamageData,
} from './inputs';
import { Element } from './types';

const data = {
  characters: charactersData,
  growth: growthData,
  buffs: buffsData,
} as unknown as DamageData;

/** Témoin : premier perso du roster avec bursts (kit complet S1/S2/S3). */
const CHAR_ID = '2000001';
const char = data.characters.characters[CHAR_ID];

const attackerBase = (): AttackerBuildInput => ({
  id: CHAR_ID,
  level: 120,
  affinityTier: 0,
  codexLevel: 0,
  skillLevels: {},
  sheet: { atk: 10000, critical_dmg: 1500 },
});

describe('inputs — référentiels', () => {
  it('éléments CET_* et slugs UI → enum du moteur', () => {
    expect(elementOf('CET_FIRE')).toBe(Element.Fire);
    expect(elementOf('water')).toBe(Element.Water);
    expect(elementOf('CET_INCONNU')).toBeUndefined();
  });

  it('palier post-100 : lu dans maxLevelSteps pour (élément, étoiles, niveau)', () => {
    expect(modifierAfter100For(char, 100, data.growth)).toBe(0);
    const at120 = modifierAfter100For(char, 120, data.growth);
    expect(at120).toBeGreaterThan(0); // palier 3 réel du jeu (700 ‰ en 1.4.9)
    const at103 = modifierAfter100For(char, 103, data.growth);
    expect(at103).toBeGreaterThan(0);
    expect(at103).toBeLessThan(at120);
  });
});

describe('inputs — affinité et chips', () => {
  it('trustBuffs : plats RÉSOLUS depuis buffs.json, cumulés par palier', () => {
    expect(trustBuffs(0, data.buffs)).toEqual([]);
    const t5 = trustBuffs(5, data.buffs);
    expect(t5).toHaveLength(15); // 3 stats × 5 paliers
    const sum = (st: string) =>
      t5.filter((b) => b.stat === st).reduce((s, b) => s + (b.value ?? 0), 0);
    // Témoins binaires re-vérifiés par l'extracteur : +60/+40/+300 par palier.
    expect(sum('ST_ATK')).toBe(300);
    expect(sum('ST_DEF')).toBe(200);
    expect(sum('ST_HP')).toBe(1500);
    expect(t5.every((b) => b.applyingType === 'OAT_ADD')).toBe(true);
  });

  it('resolveFx : magnitudes standard ; sans standard → unresolved, jamais deviné', () => {
    const { buffs, unresolved } = resolveFx(['atk', 't_marked', 't_dmg_taken', 'def_down']);
    expect(buffs).toEqual([
      { type: 'BT_STAT', stat: 'ST_ATK', applyingType: 'OAT_RATE', value: 300 },
      { type: 'BT_MARKING' },
      { type: 'BT_STAT', stat: 'ST_DEF', applyingType: 'OAT_RATE', value: -500 },
    ]);
    expect(unresolved).toEqual(['t_dmg_taken']);
  });
});

describe('inputs — stats de combat (§ 16.1)', () => {
  it('sans buffs, combat === fiche, quel que soit le Codex (le terme A s’annule)', () => {
    const a = attackerBase();
    expect(buildCombatStats(a, char, data.growth, []).atk).toBe(10000);
    a.codexLevel = 11;
    expect(buildCombatStats(a, char, data.growth, []).atk).toBe(10000);
  });

  it('l’affinité s’ajoute en plat AVANT le multiplicateur ; le Codex reste hors multiplicateur', () => {
    const a = attackerBase();
    a.codexLevel = 11;
    const trust = trustBuffs(5, data.buffs);
    // Plats seuls : +300 ATK, indépendant du terme Codex.
    expect(buildCombatStats(a, char, data.growth, trust).atk).toBe(10300);
    // Avec un chip +30 % : l'identité § 16.1 exacte, A recalculé de la donnée.
    const chip = resolveFx(['atk']).buffs;
    const codexRow = data.growth.archive.find((r) => r.level === 11)!;
    const base = calcBaseStat(
      char.baseStats.Atk.min,
      char.baseStats.Atk.max,
      120,
      modifierAfter100For(char, 120, data.growth),
    );
    const A = Math.trunc((base * codexRow.atkRate) / 1000);
    const expected = Math.trunc(((10000 - A + 300) * 1300) / 1000) + A;
    expect(buildCombatStats(a, char, data.growth, [...trust, ...chip]).atk).toBe(expected);
  });
});

describe('inputs — buildDamageReport', () => {
  const target = () => ({
    element: 'earth',
    stats: { hp: 500000, def: 2000, dmgRed: 0, cdmgRed: 0 },
    boss: true,
  });

  it('kit complet : S1/S2/S3 + les 3 états burst rattachés au slot du BURSTABLE', () => {
    const result = buildDamageReport(attackerBase(), target(), data);
    const keys = result.slots.map((s) => `${s.slot}${s.burst ? `b${s.burst}` : ''}`);
    expect(keys).toEqual(['S1', 'S2', 'S3', 'S2b1', 'S2b2', 'S2b3']);
    // Niveau par défaut = max du skill ; les bursts suivent le niveau du
    // burstable (`burstAP` — garde datagen : niveaux alignés sur tout le roster).
    for (const s of result.slots) expect(s.skillLevel).toBeGreaterThan(0);
    expect(result.unresolvedFx).toEqual([]);
    // Normal et crit sont TOUJOURS émis (les dégâts d'une branche ne
    // dépendent pas de sa probabilité) : sans CHC saisie, P(crit) = 0 mais
    // la valeur reste affichable. Le miss n'existe qu'avec un buff de
    // « miss chance » — absent par défaut.
    for (const s of result.slots) {
      for (const st of s.report.states) {
        expect(st.branches.map((b) => b.branch)).toEqual(['normal', 'critical']);
        expect(st.branches[0].probability).toBe(1);
        expect(st.branches[1].probability).toBe(0);
        for (const b of st.branches) expect(b.totalDamage).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('burstable au S1 (Caren 2000089) : les bursts se rattachent au S1, pas au S2', () => {
    // Le cas qui a montré le bug (Sevih 18/08/2026 — « la table result
    // affiche S2 B1… ») : `burstAP` vit sur son S1 (8901), les déclinaisons
    // 8919/8920/8921 doivent suivre.
    const result = buildDamageReport({ ...attackerBase(), id: '2000089' }, target(), data);
    const keys = result.slots.map((s) => `${s.slot}${s.burst ? `b${s.burst}` : ''}`);
    expect(keys).toEqual(['S1', 'S2', 'S3', 'S1b1', 'S1b2', 'S1b3']);
    expect(result.dataIssues).toBeUndefined();
  });

  it('bursts au NIVEAU du burstable : S1 saisi = niveau des lignes burst, pas le S2', () => {
    const result = buildDamageReport(
      { ...attackerBase(), id: '2000089', skillLevels: { S1: 2, S2: 5 } },
      target(),
      data,
    );
    const bursts = result.slots.filter((s) => s.burst !== undefined);
    expect(bursts).toHaveLength(3);
    for (const b of bursts) expect(b.skillLevel).toBe(2);
  });

  it('bursts SANS marqueur burstAP : lignes omises et SIGNALÉES, jamais un slot supposé', () => {
    // Artefact antérieur à l'extraction du marqueur (ou RequireAP inattendu) :
    // rejouer « toujours S2 » calculerait faux en silence pour les 60 persos
    // burst-S1 — le moteur préfère omettre et le dire (revue 18/08/2026).
    const stripped = {
      ...data,
      characters: {
        ...data.characters,
        skills: Object.fromEntries(
          Object.entries(data.characters.skills).map(([id, s]) => {
            if (!s.burstAP) return [id, s];
            const rest = { ...s };
            delete rest.burstAP;
            return [id, rest];
          }),
        ),
      },
    } as DamageData;
    const result = buildDamageReport({ ...attackerBase(), id: '2000089' }, target(), stripped);
    expect(result.slots.map((s) => s.slot)).toEqual(['S1', 'S2', 'S3']);
    expect(result.dataIssues).toHaveLength(1);
    expect(result.dataIssues![0]).toContain('burstAP');
  });

  it('l’élément joue : cible avec avantage subit plus que cible qui domine', () => {
    const vsEarth = buildDamageReport(attackerBase(), target(), data); // feu > terre
    const vsWater = buildDamageReport(attackerBase(), { ...target(), element: 'water' }, data);
    const total = (r: typeof vsEarth) => r.slots[0].report.states[0].branches[0].totalDamage;
    expect(total(vsEarth)).toBeGreaterThan(total(vsWater));
  });

  it('chips cible non standard → unresolvedFx remonté, le calcul continue', () => {
    const result = buildDamageReport(
      { ...attackerBase(), fx: ['atk'] },
      { ...target(), fx: ['t_dmg_taken', 't_def_down'] },
      data,
    );
    expect(result.unresolvedFx).toEqual(['t_dmg_taken']);
    expect(result.slots.length).toBeGreaterThan(0);
  });

  it('avec { trace: true } : chaque branche porte sa trace, § 8.3 en dernier', () => {
    const result = buildDamageReport(attackerBase(), target(), data, { trace: true });
    const branch = result.slots[0].report.states[0].branches[0];
    expect(branch.trace?.at(-1)).toMatchObject({ ref: '§ 8.3', out: branch.totalDamage });
  });

  it('un buff référencé par PLUSIEURS skills entre UNE fois (dédup — un templet, une instance)', () => {
    // Eris : 2000117_2_4 est référencé par le S2 (11702) ET le S3 (11703) —
    // avant la dédup, chaque référence redevenait une entrée et les slots
    // multi-callers comptaient double (revue 18/08/2026).
    const eris = buildDamageReport({ ...attackerBase(), id: '2000117' }, target(), data);
    expect(eris.kitPassives!.entries.filter((e) => e.buffId === '2000117_2_4')).toHaveLength(1);
    // Rhona : 2000008_1_4 (BT_DMG_TO_BOSS +500 ‰) référencé par S1/S2/S3 —
    // compté TROIS fois avant (+1500 ‰ vs boss).
    const rhona = buildDamageReport({ ...attackerBase(), id: '2000008' }, target(), data);
    expect(rhona.kitPassives!.entries.filter((e) => e.buffId === '2000008_1_4')).toHaveLength(1);
    // Caren : 2000089_u_1_2 (BT_DMG +300 ‰, callers B1/B2) référencé par les
    // deux skills burst — les lignes B1/B2 recevaient +600 ‰.
    const caren = buildDamageReport({ ...attackerBase(), id: '2000089' }, target(), data);
    expect(caren.kitPassives!.entries.filter((e) => e.buffId === '2000089_u_1_2')).toHaveLength(1);
  });
});

describe('inputs — procs SKILL_START au lanceur (captures 18/08/2026)', () => {
  const target = (boss: boolean) => ({
    element: 'earth',
    stats: { hp: 500000, def: 2000, dmgRed: 0, cdmgRed: 0 },
    boss,
  });
  const dmg = (r: ReturnType<typeof buildDamageReport>, key: string, branch = 'normal') => {
    const s = r.slots.find((x) => `${x.slot}${x.burst ? `b${x.burst}` : ''}` === key);
    return s?.report.states[0].branches.find((b) => b.branch === branch)?.totalDamage ?? 0;
  };

  it('Rhona (2000008) : +300 ‰ pierce TARGET_IS_BOSS — le S1 tape PLUS un boss qu’un non-boss', () => {
    // Le proc `2000008_passive_3` (SKILL_START, porté par le passif de classe,
    // caller SKT_ALL, condition TARGET_IS_BOSS) pèse sur tous ses skills face
    // à un boss — PROUVÉ à 0.00 % par la fixture rhona-meteos. Ici, même
    // scénario boss/non-boss : seul le pierce (et le BT_DMG_TO_BOSS) bougent.
    const rhona = () => ({ ...attackerBase(), id: '2000008', sheet: { atk: 3000, hp: 20000 } });
    const vsBoss = buildDamageReport(rhona(), target(true), data);
    const vsMob = buildDamageReport(rhona(), target(false), data);
    expect(dmg(vsBoss, 'S1')).toBeGreaterThan(dmg(vsMob, 'S1'));
    // Son autre proc SKILL_START (`2000008_passive` : crit rate -100 %) est
    // inconditionnel : Rhona ne crit JAMAIS — P(crit) = 0 sur toute ligne.
    for (const s of vsBoss.slots) {
      for (const st of s.report.states) {
        const crit = st.branches.find((b) => b.branch === 'critical');
        expect(crit?.probability ?? 0).toBe(0);
      }
    }
  });

  it('Caren (2000089) : le pierce du proc 2000089_3_1 pèse sur S3/B2 SEULS — B2 > B1, B1 = S1-facteur', () => {
    // La donnée (buffIds de 8903/8920/8921) et la mesure (ratio B2/B1 exact)
    // disent la même chose : le +300 ‰ pierce vit au lancement du S3, du B2
    // et du B3 — jamais sur S1/B1.
    const caren = () => ({
      ...attackerBase(),
      id: '2000089',
      sheet: { atk: 2070, def: 5631, critical_dmg: 2400, pierce_power_rate: 110 },
    });
    const r = buildDamageReport(caren(), target(true), data);
    // B1 et B2 partagent facteur et niveaux : SEUL le pierce les sépare.
    expect(dmg(r, 'S1b2', 'critical')).toBeGreaterThan(dmg(r, 'S1b1', 'critical'));
  });

  it('facteur total § 8.1 : une chaîne qui somme sous 1000 ‰ est complétée et MARQUÉE', () => {
    // Le S1 de Caren (300+400 ‰ en table) frappe 1000 ‰ en jeu (mesuré) ; le
    // S3 (5×200 ‰) est complet — pas de flag.
    const r = buildDamageReport({ ...attackerBase(), id: '2000089' }, target(true), data);
    const state = (key: string) =>
      r.slots.find((x) => `${x.slot}${x.burst ? `b${x.burst}` : ''}` === key)!.report.states[0];
    expect(state('S1').totalFactor).toBe(1000);
    expect(state('S1').factorFilled).toBe(true);
    expect(state('S3').totalFactor).toBe(1000);
    expect(state('S3').factorFilled).toBeUndefined();
  });

  it('débuff au LANCEMENT côté cible (Rhona 2000008_3_3 : DEF -50 % au S3) — le canal par slot baisse la DEF de SA ligne', () => {
    // Même scénario, S3 vs S1 : la ligne S3 se calcule contre une DEF
    // réduite de moitié — un ratio S3/S1 nettement au-dessus du seul écart
    // de facteur de skill. Témoin directionnel : la DEF slot ne fuit pas
    // sur les autres lignes (le S1 garde la DEF pleine).
    const rhona = () => ({ ...attackerBase(), id: '2000008', sheet: { atk: 3000, hp: 20000 } });
    const full = buildDamageReport(rhona(), target(true), data);
    // Repère : le MÊME kit privé du débuff (clone), face à une cible dont la
    // DEF est déjà divisée par deux — son S3 doit coïncider avec celui du
    // rapport complet (le canal par slot fait exactement cette division), et
    // son S1 face à la DEF pleine doit coïncider aussi (le débuff ne FUIT
    // pas hors de sa ligne).
    const stripped = {
      ...data,
      characters: {
        ...data.characters,
        skills: {
          ...data.characters.skills,
          '803': {
            ...data.characters.skills['803'],
            levels: data.characters.skills['803'].levels.map((l) => ({
              ...l,
              buffIds: l.buffIds.filter((b) => b !== '2000008_3_3'),
            })),
          },
        },
      },
    } as DamageData;
    const refHalved = buildDamageReport(
      rhona(),
      { ...target(true), stats: { ...target(true).stats, def: 1000 } },
      stripped,
    );
    const refFull = buildDamageReport(rhona(), target(true), stripped);
    expect(dmg(full, 'S3')).toBe(dmg(refHalved, 'S3'));
    expect(dmg(full, 'S1')).toBe(dmg(refFull, 'S1'));
  });
});

describe('inputs — compteurs § 9.1 (buffs/débuffs déclarés)', () => {
  const target = () => ({
    element: 'earth',
    stats: { hp: 500000, def: 2000, dmgRed: 0, cdmgRed: 0 },
    boss: true,
  });
  const damages = (r: ReturnType<typeof buildDamageReport>) =>
    Object.fromEntries(
      r.slots.map((s) => [
        `${s.slot}${s.burst ? `b${s.burst}` : ''}`,
        s.report.states[0].branches[0].totalDamage,
      ]),
    );

  it('Eris (2000117_2_4, ×débuffs de la CIBLE, callers S2/S3) : n=3 > n=0 sur S2/S3 SEULS', () => {
    const eris = () => ({ ...attackerBase(), id: '2000117' });
    const n0 = damages(buildDamageReport(eris(), target(), data));
    const n3 = damages(buildDamageReport(eris(), { ...target(), debuffCount: 3 }, data));
    expect(n3.S2).toBeGreaterThan(n0.S2);
    expect(n3.S3).toBeGreaterThan(n0.S3);
    // S1 hors callers : invariant. Les BURSTS aussi : le CSV du jeu ne liste
    // que SKT_SECOND,SKT_ULTIMATE — fidélité à la donnée, jamais élargi.
    expect(n3.S1).toBe(n0.S1);
    expect(n3.S2b1).toBe(n0.S2b1);
    expect(n3.S2b3).toBe(n0.S2b3);
  });

  it('H. Dianne (2000093_3_1, ×Σ buffs de l’ÉQUIPE, caller S3) : teamBuffCount ne pèse que sur le S3', () => {
    const hdianne = () => ({ ...attackerBase(), id: '2000093' });
    const n0 = damages(buildDamageReport(hdianne(), target(), data));
    const n4 = damages(buildDamageReport({ ...hdianne(), teamBuffCount: 4 }, target(), data));
    expect(n4.S3).toBeGreaterThan(n0.S3);
    expect(n4.S1).toBe(n0.S1);
    expect(n4.S2).toBe(n0.S2);
  });

  it('compteurs absents = familles à 0 : aucun défaut deviné', () => {
    // Même scénario avec compteurs explicitement à 0 : rapport identique.
    const eris = () => ({ ...attackerBase(), id: '2000117' });
    const absent = damages(buildDamageReport(eris(), target(), data));
    const zeroed = damages(
      buildDamageReport(
        { ...eris(), buffCount: 0, debuffCount: 0, teamBuffCount: 0 },
        { ...target(), buffCount: 0, debuffCount: 0 },
        data,
      ),
    );
    expect(zeroed).toEqual(absent);
  });
});

describe('inputs — buffs MAX_HP (§ 16.2 : guilde + titre)', () => {
  const withHp = (): AttackerBuildInput => ({
    ...attackerBase(),
    sheet: { atk: 10000, hp: 50000 },
    guildLevel: 10,
  });
  const target = () => ({ element: 'earth', stats: { hp: 500000, def: 2000 }, boss: true });
  const applied = (sum: number, hp: number) =>
    Math.floor(Math.fround(eventMaxHpRate(sum) * Math.fround(hp)));

  it('slug de mode → DUNGEON_MODE ; les 4 slugs story = DM_NORMAL (découpage site)', () => {
    expect(dungeonModeOf('normal')).toBe('DM_NORMAL');
    expect(dungeonModeOf('normal_hard')).toBe('DM_NORMAL');
    expect(dungeonModeOf('origin')).toBe('DM_NORMAL');
    expect(dungeonModeOf('origin_hard')).toBe('DM_NORMAL');
    expect(dungeonModeOf('raid_1')).toBe('DM_RAID_1');
    expect(dungeonModeOf('world_boss')).toBe('DM_WORLD_BOSS');
  });

  it('guilde seule, mode éligible : HP = floor(float32(rate × HP))', () => {
    const r = buildDamageReport(withHp(), { ...target(), mode: 'raid_1' }, data);
    expect(r.maxHpBuff).toMatchObject({ sum: 15, hpBefore: 50000 }); // Lv 10 → 15
    expect(r.combatStats.hp).toBe(applied(15, 50000));
  });

  it('guilde + titre CUMULÉS en Special Request (Σ = 15 + 5 = 20)', () => {
    const a = { ...withHp(), premiumHp: true };
    const r = buildDamageReport(a, { ...target(), mode: 'raid_1' }, data);
    expect(r.maxHpBuff?.sum).toBe(20);
    expect(r.maxHpBuff?.parts.map((p) => [p.source, p.active])).toEqual([
      ['guild', true],
      ['title', true],
    ]);
    expect(r.combatStats.hp).toBe(applied(20, 50000));
  });

  it('les listes de modes DIFFÈRENT : tour normale = guilde seule, adventure = titre seul', () => {
    const a = { ...withHp(), premiumHp: true };
    const tower = buildDamageReport(a, { ...target(), mode: 'tower' }, data);
    expect(tower.maxHpBuff?.sum).toBe(15); // guilde oui, titre non
    const adv = buildDamageReport(a, { ...target(), mode: 'adventure_mission' }, data);
    expect(adv.maxHpBuff?.sum).toBe(5); // titre oui, guilde non
  });

  it('mode exclu des deux (world boss…) : Σ = 0, HP intact, parts signalées', () => {
    const a = { ...withHp(), premiumHp: true };
    for (const mode of ['world_boss', 'tower_hard', 'guild_raid_main_boss']) {
      const r = buildDamageReport(a, { ...target(), mode }, data);
      expect(r.maxHpBuff?.sum, mode).toBe(0);
      expect(r.combatStats.hp, mode).toBe(50000);
    }
  });

  it('cible manuelle : coches INDÉPENDANTES par buff', () => {
    const a = { ...withHp(), premiumHp: true };
    expect(buildDamageReport(a, target(), data).maxHpBuff?.sum).toBe(0);
    expect(buildDamageReport(a, { ...target(), guildBuffOn: true }, data).maxHpBuff?.sum).toBe(15);
    expect(buildDamageReport(a, { ...target(), titleBuffOn: true }, data).maxHpBuff?.sum).toBe(5);
    expect(
      buildDamageReport(a, { ...target(), guildBuffOn: true, titleBuffOn: true }, data).maxHpBuff
        ?.sum,
    ).toBe(20);
  });

  it('sans aucun réglage de compte : aucun bloc maxHpBuff, rien ne bouge', () => {
    const a = { ...withHp(), guildLevel: 0 };
    const r = buildDamageReport(a, { ...target(), mode: 'raid_1' }, data);
    expect(r.maxHpBuff).toBeUndefined();
    expect(r.combatStats.hp).toBe(50000);
  });
});
