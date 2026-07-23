/**
 * Tests du générateur costumes — son CŒUR PUR partagé `costumeCore` (extraction
 * commune d'une ligne CostumeTemplet : nom, icône avec repli
 * SpriteCostumeIcon→RewardCostumeIcon, grade, provenance). La vue PLATE
 * (buildCostumes) est fondue dans `items.json` (entrées `kind:'costume'`) déjà
 * couverte par le test item-catalog → pas de doublon d'invariants ici.
 *
 * Tourne SANS `.gamedata` : `costumeCore` est pur (aucune table).
 */
import { describe, expect, it } from 'vitest';
import type { LangDict } from '../lib/lang';
import type { Row } from '../lib/tables';
import { costumeCore } from './costumes';

const dict = (en: string): LangDict => ({ en, jp: '', kr: '', zh: '' });
const names = new Map<string, LangDict>([['C1_Name', dict('Radiant Dress')]]);

describe('costumeCore — extraction commune d’une ligne CostumeTemplet', () => {
  it('nom résolu, icône SpriteCostumeIcon, grade + provenance slugifiés', () => {
    const r: Row = {
      CostumeName: 'C1_Name',
      SpriteCostumeIcon: 'TI_Costume_01',
      ItemGrade: 'IG_RARE',
      CostumePurchaseType: 'CPT_EVENT_SHOP',
    };
    expect(costumeCore(r, names)).toEqual({
      name: dict('Radiant Dress'),
      icon: 'TI_Costume_01',
      grade: 'rare',
      source: 'event_shop',
    });
  });

  it('icône : repli sur RewardCostumeIcon quand le sprite manque', () => {
    const r: Row = {
      CostumeName: 'C1_Name',
      RewardCostumeIcon: 'TI_Reward_01',
      ItemGrade: 'IG_NORMAL',
    };
    expect(costumeCore(r, names).icon).toBe('TI_Reward_01');
  });

  it('provenance NONE / absente → pas de `source`', () => {
    expect(
      costumeCore({ CostumeName: 'C1_Name', CostumePurchaseType: 'CPT_NONE' }, names).source,
    ).toBeUndefined();
    expect(costumeCore({ CostumeName: 'C1_Name' }, names).source).toBeUndefined();
  });
});
