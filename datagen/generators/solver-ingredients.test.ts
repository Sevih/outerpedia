/**
 * Base d'un Core Fusion dans le contrat solver : celle du perso d'origine
 * (`CharacterFusionTemplet.CharacterID`), pas celle du templet fusionné. Le
 * client lit `CCharacterData.Templet` (ID d'origine) dans `CalcBasicStats` ;
 * trois captures ATK lv100 du 09/10/2026 le confirment (Snow, Lisha, Veronica).
 */
import { describe, expect, it } from 'vitest';
import solverCharacters from '../../data/generated/solver/characters.json';
import { computeCharacterIngredients, type IngredientsTables } from './solver-ingredients';

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
