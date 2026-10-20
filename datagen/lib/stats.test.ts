import { afterEach, describe, expect, it, vi } from 'vitest';
import { STAT_DEFS } from '../extractor/specs/character';
import { statSlug } from './effects';
import {
  canonicalStatSlug,
  formatStatValue,
  PERCENT_STAT_SLUGS,
  PERCENT_STAT_TYPES,
  STAT_TYPE_SLUGS,
} from './stats';

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

describe('table unique ST_* → slug (STAT_TYPE_SLUGS)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('les 26 `st` de STAT_DEFS, ni plus ni moins, et STAT_DEFS en dérive ses slugs', () => {
    expect(Object.keys(STAT_TYPE_SLUGS)).toHaveLength(26);
    expect(new Set(Object.keys(STAT_TYPE_SLUGS))).toEqual(new Set(STAT_DEFS.map((d) => d.st)));
    for (const d of STAT_DEFS) expect(d.slug, d.st).toBe(STAT_TYPE_SLUGS[d.st]);
    // Slugs distincts : deux STAT_TYPE ne se confondent pas dans `statScales`.
    expect(new Set(Object.values(STAT_TYPE_SLUGS)).size).toBe(26);
  });

  it('canonicalStatSlug lit la table, sans avertir', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    for (const [st, slug] of Object.entries(STAT_TYPE_SLUGS))
      expect(canonicalStatSlug(st), st).toBe(slug);
    expect(canonicalStatSlug('ST_DMG_BOOST')).toBe('damage_boost');
    expect(canonicalStatSlug('ST_DMG_REDUCE_RATE')).toBe('dmg_reduce');
    expect(canonicalStatSlug('ST_NONE')).toBeNull();
    expect(canonicalStatSlug(undefined)).toBeNull();
    expect(warn).not.toHaveBeenCalled();
  });

  it('un ST_* inconnu : repli mécanique + avertissement qui le nomme', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(canonicalStatSlug('ST_NEW_THING_RATE')).toBe('new_thing_rate');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain('ST_NEW_THING_RATE');
  });

  it('statSlug (effets de buff) garde le slug MÉCANIQUE', () => {
    expect(statSlug('ST_DMG_BOOST')).toBe('dmg_boost');
    expect(statSlug('ST_DMG_REDUCE_RATE')).toBe('dmg_reduce_rate');
  });
});
