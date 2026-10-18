/**
 * Base d'un Core Fusion dans le contrat solver : celle du perso d'origine
 * (`CharacterFusionTemplet.CharacterID`), pas celle du templet fusionné. Le
 * client lit `CCharacterData.Templet` (ID d'origine) dans `CalcBasicStats` ;
 * trois captures ATK lv100 du 09/10/2026 le confirment (Snow, Lisha, Veronica).
 */
import { describe, expect, it } from 'vitest';
import solverCharacters from '../../data/generated/solver/characters.json';
import { STAT_KEYS } from '../lib/stat-keys';
import {
  applyStatBonus,
  computeCharacterIngredients,
  type IngredientsTables,
  type StatBlock,
} from './solver-ingredients';

type Row = Record<string, string>;

function pcRow(id: string, atkMax: number, skill23?: string): Row {
  return {
    ID: id,
    Type: 'CT_PC',
    NameID: `${id}_Name`,
    BasicStar: '3',
    Atk_Min: String(Math.round(atkMax / 10)),
    Atk_Max: String(atkMax),
    ...(skill23 ? { Skill_23: skill23 } : {}),
  };
}

function tables(over: Partial<IngredientsTables>): IngredientsTables {
  return {
    characterTemplet: [],
    evoStats: [],
    archiveStats: [],
    transcendent: [],
    skillLevels: [],
    buffs: [],
    awakLevels: [],
    awakNodes: [],
    fusionTemplet: [],
    fusionLevelTemplet: [],
    ...over,
  };
}

describe('computeCharacterIngredients — Core Fusion', () => {
  it("base et évolution d'un fusionné viennent du perso d'origine", () => {
    const { characters } = computeCharacterIngredients(
      tables({
        characterTemplet: [pcRow('2000003', 659), pcRow('2700003', 757)],
        fusionTemplet: [{ CharacterID: '2000003', ChangeCharID: '2700003' }],
        evoStats: [
          {
            CharacterID: '2000003',
            EvolutionLevel: '1',
            RewardStatType_1: 'ST_ATK',
            RewardValue_1: '45',
          },
        ],
      }),
    );
    expect(characters['2700003'].base.atk).toEqual({ min: 66, max: 659 });
    expect(characters['2700003'].base).toEqual(characters['2000003'].base);
    expect(characters['2700003'].evoByLevel['1'].atk).toBe(45);
  });

  it('un perso sans ligne de fusion garde sa propre base', () => {
    const { characters } = computeCharacterIngredients(
      tables({ characterTemplet: [pcRow('2000003', 659), pcRow('2700099', 900)] }),
    );
    expect(characters['2700099'].base.atk.max).toBe(900);
  });
});

describe('computeCharacterIngredients — échelle de transcendance', () => {
  // Barème 2★ du jeu : les lignes 5, 7, 8 existent, à `UseTransStar` faux.
  const ladder2: Row[] = [2, 3, 4, 5, 6, 7, 8, 9].map((star) => ({
    CharacterID: '0',
    BasicStar: '2',
    TransStar: String(star),
    UseTransStar: [5, 7, 8].includes(star) ? 'False' : 'True',
    RewardAtkRate: String(star * 10),
  }));
  const run = () =>
    computeCharacterIngredients(
      tables({
        characterTemplet: [{ ...pcRow('2000003', 659), BasicStar: '2' }, pcRow('2700003', 757)],
        fusionTemplet: [{ CharacterID: '2000003', ChangeCharID: '2700003' }],
        transcendent: ladder2,
      }),
    ).characters;

  it('un 2★ ne garde que les paliers que le jeu parcourt', () => {
    expect(Object.keys(run()['2000003'].transcendByStar)).toEqual(['2', '3', '4', '6', '9']);
  });

  it("un fusionné d'origine 2★ suit l'échelle de son origine, à partir de sa propre étoile", () => {
    const t = run()['2700003'].transcendByStar;
    expect(Object.keys(t)).toEqual(['3', '4', '6', '9']);
    expect(t['6'].atkPct).toBe(6);
  });
});

describe('solver/characters.json — fusionnés des captures', () => {
  const chars = solverCharacters as unknown as Record<string, { ingredients: { base: unknown } }>;
  it.each([
    ['2700003', '2000003'], // Snow
    ['2700005', '2000005'], // Lisha
    ['2700037', '2000037'], // Veronica
  ])('%s a la base de %s', (fused, origin) => {
    expect(chars[fused].ingredients.base).toEqual(chars[origin].ingredients.base);
  });

  it.each([
    ['2700003', 2], // Snow, 2★ à l'origine
    ['2700005', 2], // Lisha
    ['2700037', 3], // Veronica
  ])('%s : étoile de base et échelle de son origine (%i★)', (fused, star) => {
    const c = solverCharacters as unknown as Record<
      string,
      { star: number; ingredients: { transcendByStar: Record<string, unknown> } }
    >;
    expect(c[fused].star).toBe(star);
    expect(Object.keys(c[fused].ingredients.transcendByStar)).toEqual(
      star === 2 ? ['3', '4', '6', '9'] : ['3', '4', '5', '6', '7', '8', '9'],
    );
  });
});

// ---- B56 : noyau par niveau de fusion, vitesse en taux, filtre du client ----------
function sheetBuff(id: string, st: string, value: number, over: Row = {}): Row {
  return {
    BuffID: id,
    Level: '1',
    Type: 'BT_STAT_PREMIUM',
    BuffCreateType: 'PASSIVE',
    TargetType: 'ME',
    StatType: st,
    ApplyingType: 'OAT_RATE',
    Value: String(value),
    ...over,
  };
}
const fusionLevels: Row[] = [1, 2, 3, 4, 5].map((lv) => ({
  FusionGroupID: '9',
  FusionLevel: String(lv),
  Skill_23_Level: lv === 5 ? '2' : '1',
}));

function fused(skill23Levels: Row[], buffs: Row[]) {
  return computeCharacterIngredients(
    tables({
      characterTemplet: [
        { ...pcRow('2000003', 659), Speed_Max: '138' },
        pcRow('2700003', 757, '27000231'),
      ],
      fusionTemplet: [{ CharacterID: '2000003', ChangeCharID: '2700003', FusionGroupID: '9' }],
      fusionLevelTemplet: fusionLevels,
      evoStats: [
        {
          CharacterID: '2000003',
          EvolutionLevel: '1',
          RewardStatType_1: 'ST_SPEED',
          RewardValue_1: '16',
        },
      ],
      skillLevels: skill23Levels,
      buffs,
    }),
  ).characters['2700003'];
}

describe('computeCharacterIngredients — corePassiveByFusion', () => {
  it('Skill_23 au niveau du palier : rien aux fusions 1-4, le buff à la fusion 5 (Notia)', () => {
    const c = fused(
      [
        { SkillID: '27000231', SkillLevel: '1', BuffID: '' },
        { SkillID: '27000231', SkillLevel: '2', BuffID: 'eff' },
      ],
      [sheetBuff('eff', 'ST_BUFF_CHANCE', 500)],
    );
    const byFusion = c.corePassiveByFusion!;
    expect(Object.keys(byFusion)).toEqual(['1', '2', '3', '4', '5']);
    for (const lv of ['1', '2', '3', '4'])
      expect(Object.values(byFusion[lv]).every((v) => v === 0)).toBe(true);
    expect(byFusion['5'].effRate).toBe(50);
    // L'ancien champ reste au niveau max.
    expect(c.corePassive?.effRate).toBe(50);
  });

  it('SPD OAT_RATE : taux brut dans spdPct, spd à 0 ; corePassive garde le plat cuit (Snow)', () => {
    const lv = (n: string) => ({ SkillID: '27000231', SkillLevel: n, BuffID: 'spd,atk' });
    const c = fused(
      [lv('1'), lv('2')],
      [sheetBuff('spd', 'ST_SPEED', 43), sheetBuff('atk', 'ST_ATK', 102)],
    );
    for (const block of Object.values(c.corePassiveByFusion!)) {
      expect(block.spdPct).toBe(4.3);
      expect(block.spd).toBe(0);
      expect(block.atkPct).toBe(10.2);
    }
    // floor((138 + 16) × 43 / 1000) = 6 : l'encodage que lisent les versions installées.
    expect(c.corePassive?.spd).toBe(6);
    expect(c.corePassive).not.toHaveProperty('spdPct');
  });

  it('un fusionné sans buff de fiche a cinq blocs à zéro, un non-fusionné pas de champ', () => {
    const { characters } = computeCharacterIngredients(
      tables({
        characterTemplet: [pcRow('2000037', 600), pcRow('2700037', 700)],
        fusionTemplet: [{ CharacterID: '2000037', ChangeCharID: '2700037', FusionGroupID: '9' }],
        fusionLevelTemplet: fusionLevels,
      }),
    );
    const byFusion = characters['2700037'].corePassiveByFusion!;
    expect(Object.keys(byFusion)).toEqual(['1', '2', '3', '4', '5']);
    expect(Object.values(byFusion).every((b) => Object.values(b).every((v) => v === 0))).toBe(true);
    expect(characters['2000037']).not.toHaveProperty('corePassiveByFusion');
  });
});

describe('computeCharacterIngredients — filtre des buffs de compétence = isStatSheetBuff', () => {
  const s2 = (buffs: Row[]) =>
    computeCharacterIngredients(
      tables({
        characterTemplet: [{ ...pcRow('2000017', 600), Skill_2: '20000172' }],
        skillLevels: [
          { SkillID: '20000172', SkillLevel: '1', BuffID: buffs.map((b) => b.BuffID).join(',') },
        ],
        buffs,
      }),
    ).characters['2000017'].s2ByLevel['1'];

  it('MY_TEAM, condition et durée ne l’écartent pas ; hors PASSIVE, si', () => {
    const b = s2([
      sheetBuff('team', 'ST_ATK', 50, { TargetType: 'MY_TEAM' }),
      sheetBuff('cond', 'ST_DEF', 30, { BuffConditionType: 'HP_RATE', TurnDuration: '2' }),
      sheetBuff('spawn', 'ST_HP', 70, { BuffCreateType: 'ON_SPAWN' }),
    ]);
    expect(b.atkPct).toBe(5);
    expect(b.defPct).toBe(3);
    expect(b.hpPct).toBe(0);
  });

  it('garde : un SPD OAT_RATE de fiche hors du noyau fait jeter le générateur', () => {
    expect(() => s2([sheetBuff('spd', 'ST_SPEED', 43)])).toThrow(/SPD OAT_RATE 43 ‰ dans Skill_2/);
  });

  it('garde : idem pour le passif de classe', () => {
    expect(() =>
      computeCharacterIngredients(
        tables({
          characterTemplet: [{ ...pcRow('2000017', 600), Skill_22: '22' }],
          skillLevels: [{ SkillID: '22', SkillLevel: '1', BuffID: 'spd' }],
          buffs: [sheetBuff('spd', 'ST_SPEED', 43)],
        }),
      ),
    ).toThrow(/classPassive/);
  });
});

describe('solver/characters.json — corePassiveByFusion des six fusionnés', () => {
  type Block = Record<string, number>;
  const ing = (id: string) =>
    (
      solverCharacters as unknown as Record<
        string,
        { ingredients: { corePassive: Block | null; corePassiveByFusion?: Record<string, Block> } }
      >
    )[id].ingredients;
  const nonZero = (b: Block) => Object.fromEntries(Object.entries(b).filter(([, v]) => v !== 0));

  it('Notia (2700056) : fusions 1 à 4 à zéro, fusion 5 effRate 50', () => {
    const f = ing('2700056').corePassiveByFusion!;
    expect(Object.keys(f)).toEqual(['1', '2', '3', '4', '5']);
    for (const lv of ['1', '2', '3', '4']) expect(nonZero(f[lv])).toEqual({});
    expect(nonZero(f['5'])).toEqual({ effRate: 50 });
  });

  it.each(['2700003', '2700005'])(
    '%s (Snow, Lisha) : mêmes buffs aux cinq niveaux, SPD en taux',
    (id) => {
      const f = ing(id).corePassiveByFusion!;
      expect(Object.keys(f)).toEqual(['1', '2', '3', '4', '5']);
      for (const b of Object.values(f)) {
        expect(nonZero(b)).toEqual({ atkPct: 10.2, defPct: 2.7, hpPct: 12.5, spdPct: 4.3 });
        expect(b.spd).toBe(0);
      }
    },
  );

  it.each(['2700037', '2700043', '2700070'])(
    '%s (Veronica, Eternal, Epsilon) : cinq blocs à zéro',
    (id) => {
      const f = ing(id).corePassiveByFusion!;
      expect(Object.keys(f)).toEqual(['1', '2', '3', '4', '5']);
      for (const b of Object.values(f)) expect(nonZero(b)).toEqual({});
    },
  );

  it('corePassive inchangé : Snow garde la vitesse cuite (+6)', () => {
    expect(ing('2700003').corePassive?.spd).toBe(6);
    expect(ing('2700003').corePassive).not.toHaveProperty('spdPct');
  });
});

describe('applyStatBonus tenu contre stat-keys (L6)', () => {
  const ZERO: StatBlock = {
    atk: 0,
    def: 0,
    hp: 0,
    spd: 0,
    chc: 0,
    chd: 0,
    pen: 0,
    dmgInc: 0,
    dmgRed: 0,
    eff: 0,
    res: 0,
    effRate: 0,
    resRate: 0,
    atkPct: 0,
    defPct: 0,
    hpPct: 0,
  };
  const BLOCK_KEYS = new Set([...Object.keys(ZERO), 'spdPct']);
  const pairs = Object.entries(STAT_KEYS).flatMap(([st, byAp]) =>
    Object.entries(byAp).map(([ap, key]) => ({ st, ap, key })),
  );
  const pour = (st: string, ap: string) => {
    const dest: StatBlock & { spdPct?: number } = { ...ZERO };
    const rate = st === 'ST_SPEED' && ap === 'OAT_RATE';
    applyStatBonus(dest, st, ap, 100, rate ? { kind: 'rate' } : { kind: 'reject', block: 'test' });
    return Object.fromEntries(Object.entries(dest).filter(([, v]) => v !== 0));
  };

  it('les clés hors bloc sont les cinq clés nouvelles du contrat', () => {
    const outside = [...new Set(pairs.map((p) => p.key).filter((k) => !BLOCK_KEYS.has(k)))];
    expect(outside.sort()).toEqual(['avoid', 'cdmgRed', 'counter', 'enterAp', 'lifesteal']);
  });

  it.each(pairs.filter((p) => BLOCK_KEYS.has(p.key)))(
    '$st / $ap : la valeur va dans $key et nulle part ailleurs',
    ({ st, ap, key }) => {
      expect(Object.keys(pour(st, ap))).toEqual([key]);
    },
  );

  it.each(pairs.filter((p) => !BLOCK_KEYS.has(p.key)))(
    '$st / $ap ($key) : rien n’est versé',
    ({ st, ap }) => {
      expect(pour(st, ap)).toEqual({});
    },
  );
});
