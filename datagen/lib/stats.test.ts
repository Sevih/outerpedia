import { afterEach, describe, expect, it, vi } from 'vitest';
import { STAT_DEFS } from '../extractor/specs/character';
import {
  formatStatValue,
  PERCENT_STAT_SLUGS,
  PERCENT_STAT_TYPES,
  STAT_SLUG_TYPES,
  STAT_TYPE_SLUGS,
  statSlug,
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
  it('13 entrées, slugs dérivés par statSlug (la table)', () => {
    expect(PERCENT_STAT_TYPES.size).toBe(13);
    expect(PERCENT_STAT_SLUGS.size).toBe(13);
    expect(PERCENT_STAT_SLUGS.has('hit_hp_recovery')).toBe(true);
    expect(PERCENT_STAT_SLUGS.has('get_char_exp_rate')).toBe(true);
    expect(PERCENT_STAT_SLUGS.has('damage_boost')).toBe(true);
    expect(PERCENT_STAT_SLUGS.has('dmg_boost')).toBe(false);
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

  it('statSlug lit la table, sans avertir — la fonction UNIQUE (C27)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    for (const [st, slug] of Object.entries(STAT_TYPE_SLUGS)) expect(statSlug(st), st).toBe(slug);
    // Les effets de buff ne gardent plus le slug mécanique (`dmg_boost`).
    expect(statSlug('ST_DMG_BOOST')).toBe('damage_boost');
    expect(statSlug('ST_DMG_REDUCE_RATE')).toBe('dmg_reduce');
    expect(statSlug('ST_HIT_AP')).toBe('hit_bp');
    expect(statSlug('ST_CRITICAL_RATE')).toBe('critical_rate');
    expect(statSlug('ST_NONE')).toBeNull();
    expect(statSlug(undefined)).toBeNull();
    expect(warn).not.toHaveBeenCalled();
  });

  it('un ST_* inconnu : repli mécanique + UN avertissement qui le nomme', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(statSlug('ST_NEW_THING_RATE')).toBe('new_thing_rate');
    expect(statSlug('ST_NEW_THING_RATE')).toBe('new_thing_rate');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain('ST_NEW_THING_RATE');
  });

  it('STAT_SLUG_TYPES est l’inverse exact de la table', () => {
    expect(Object.keys(STAT_SLUG_TYPES)).toHaveLength(26);
    for (const [st, slug] of Object.entries(STAT_TYPE_SLUGS))
      expect(STAT_SLUG_TYPES[slug]).toBe(st);
  });
});
