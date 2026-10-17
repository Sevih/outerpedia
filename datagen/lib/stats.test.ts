import { describe, expect, it } from 'vitest';
import { formatStatValue, PERCENT_STAT_SLUGS, PERCENT_STAT_TYPES } from './stats';

describe('formatStatValue', () => {
  it('OAT_RATE = per-mille → %', () => {
    expect(formatStatValue('OAT_RATE', 300)).toBe('30%');
    expect(formatStatValue('OAT_RATE', 9)).toBe('0.9%');
  });
  it('OAT_ADD = valeur plate', () => {
    expect(formatStatValue('OAT_ADD', 18)).toBe('18');
    expect(formatStatValue('OAT_NONE', 0)).toBe('0');
  });
});

describe('liste « % » du client (IsPercentStat)', () => {
  it('13 entrées, slugs dérivés par slugEnum', () => {
    expect(PERCENT_STAT_TYPES.size).toBe(13);
    expect(PERCENT_STAT_SLUGS.size).toBe(13);
    expect(PERCENT_STAT_SLUGS.has('hit_hp_recovery')).toBe(true);
    expect(PERCENT_STAT_SLUGS.has('get_character_exp_rate')).toBe(true);
  });
  it('règle de GetStatValue : OAT_RATE ou stat de la liste → %, sinon brut', () => {
    expect(formatStatValue('OAT_ADD', 50, 'buff_chance')).toBe('50');
    expect(formatStatValue('OAT_ADD', 150, 'vampiric')).toBe('15%');
    expect(formatStatValue('OAT_RATE', 50, 'buff_chance')).toBe('5%');
  });
});
