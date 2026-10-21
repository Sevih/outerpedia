import { describe, expect, it } from 'vitest';
import type { CharacterIngredients } from '@contracts';
import { contractAbbrs, contractKeyToAbbr, statSlugToAbbr } from './stat-keys';
import { RECO_STAT_LABELS } from './reco-api';
import { slugEnum } from '@/../datagen/lib/enums';
import glossariesData from '@data/generated/glossaries.json';
import solverCharactersData from '@data/generated/solver/characters.json';
import statKeysData from '@data/generated/solver/stat-keys.json';

const SOLVER = solverCharactersData as unknown as Record<
  string,
  { ingredients: CharacterIngredients }
>;
const SCALES = (glossariesData as unknown as { statScales: Record<string, string> }).statScales;
const STAT_KEYS = statKeysData as unknown as Record<string, Record<string, { percent: boolean }>>;

/**
 * `stat-keys.ts` — les tables de clés de stats du wiki DÉRIVÉES de
 * `solver/stat-keys.json` (L6). Ces tests figent les tables d'avant la
 * dérivation (recopiées à la main dans `char-progression.ts` et
 * `monster-stats.ts`) : une ligne du contrat qui bouge casse ici, pas en
 * silence sur la fiche.
 */
describe('contractKeyToAbbr — `BLOCK_KEY` de la fiche', () => {
  it('vaut les 11 paires de la table recopiée, plus `cdmgRed` (champ absent de `StatBlock`)', () => {
    expect(contractKeyToAbbr()).toEqual({
      atk: 'ATK',
      def: 'DEF',
      hp: 'HP',
      spd: 'SPD',
      chc: 'CHC',
      chd: 'CHD',
      pen: 'PEN%',
      dmgInc: 'DMG UP%',
      dmgRed: 'DMG RED%',
      eff: 'EFF',
      res: 'RES',
      cdmgRed: 'CDMG RED%',
    });
  });

  it('couvre tout champ plat d’un bloc d’évolution réel du contrat', () => {
    const table = contractKeyToAbbr();
    const fields = new Set<string>();
    for (const { ingredients } of Object.values(SOLVER))
      for (const block of Object.values(ingredients.evoByLevel))
        for (const f of Object.keys(block)) if (!/(Pct|Rate)$/.test(f)) fields.add(f);
    expect(fields.size).toBeGreaterThan(0);
    for (const f of fields) expect(table, f).toHaveProperty(f);
  });
});

describe('statSlugToAbbr — `BONUS_KEY` des quirks / skill_8', () => {
  it('vaut les 12 paires de la table recopiée', () => {
    expect(statSlugToAbbr()).toEqual({
      atk: 'ATK',
      def: 'DEF',
      hp: 'HP',
      speed: 'SPD',
      critical_rate: 'CHC',
      critical_dmg: 'CHD',
      damage_boost: 'DMG UP%',
      dmg_reduce: 'DMG RED%',
      pierce_power_rate: 'PEN%',
      enemy_critical_dmg_reduce: 'CDMG RED%',
      buff_chance: 'EFF',
      buff_resist: 'RES',
    });
  });
});

describe('contractAbbrs — `STAT_KEY` de reco-api reste local, sa partie gauche est gardée', () => {
  it('chaque libellé traduit vers le moteur est une abréviation du contrat', () => {
    const abbrs = contractAbbrs();
    for (const label of RECO_STAT_LABELS) expect(abbrs.has(label), label).toBe(true);
  });
});

describe('stat-keys.json et statScales disent la même nature', () => {
  it('la ligne `OAT_ADD` est en % ssi le glossaire dit `percent` (même source : `IsPercentStat`)', () => {
    const common = Object.entries(STAT_KEYS).flatMap(([st, byAp]) =>
      byAp.OAT_ADD && slugEnum(st) in SCALES ? [[slugEnum(st), byAp.OAT_ADD.percent] as const] : [],
    );
    expect(common.length).toBeGreaterThanOrEqual(8);
    for (const [slug, percent] of common) expect(SCALES[slug] === 'percent', slug).toBe(percent);
  });

  it('EFF/RES plats au glossaire', () => {
    expect(SCALES.buff_chance).toBe('flat');
    expect(SCALES.buff_resist).toBe('flat');
  });
});
