/**
 * Palier vedette des bannières : lu de la ligne `featured` de `recruit.json`,
 * repli par titre pour une bannière qui n'en a pas (la Dimensional Supply).
 */
import { describe, expect, it } from 'vitest';
import type { RecruitKind, RecruitRate } from '@contracts';
import { uniformDict } from '@datagen/lib/lang';
import { getRecruitKind } from '@/lib/data/recruit';
import { jackpotKeyOf } from './BannerBlocks';

const rate = (titleKey: string): RecruitRate => ({
  titleKey,
  title: uniformDict(titleKey),
  percent: 1,
  confirmPercent: 1,
});

describe('jackpotKeyOf', () => {
  it.each<[RecruitKind, string]>([
    ['custom', 'SYS_RECRUIT_RATEINFO_TITLE_03'],
    ['pickup', 'SYS_RECRUIT_RATEINFO_TITLE_05'],
    ['premium', 'SYS_RECRUIT_RATEINFO_TITLE_05'],
    ['limited', 'SYS_RECRUIT_RATEINFO_TITLE_05'],
    ['equipment', 'SYS_RECRUIT_EQUIP_TITLE_05'],
  ])('bannière %s : %s', (kind, key) => {
    expect(jackpotKeyOf(getRecruitKind(kind).rates)).toBe(key);
  });

  it('les quatre bannières de persos ont leur ligne `featured`, pas l’équipement', () => {
    const kinds: RecruitKind[] = ['custom', 'pickup', 'premium', 'limited'];
    for (const kind of kinds) expect(getRecruitKind(kind).rates.some((r) => r.featured)).toBe(true);
    expect(getRecruitKind('equipment').rates.some((r) => r.featured)).toBe(false);
  });

  it('la ligne `featured` prime sur le titre', () => {
    const rates = [rate('X_TITLE_05'), { ...rate('X_TITLE_02'), featured: true as const }];
    expect(jackpotKeyOf(rates)).toBe('X_TITLE_02');
  });

  it('sans ligne `featured`, repli sur `_TITLE_05` puis `_TITLE_03`', () => {
    expect(jackpotKeyOf([rate('X_TITLE_03'), rate('X_TITLE_05'), rate('X_TITLE_01')])).toBe(
      'X_TITLE_05',
    );
    expect(jackpotKeyOf([rate('X_TITLE_02'), rate('X_TITLE_03')])).toBe('X_TITLE_03');
    expect(jackpotKeyOf([rate('X_TITLE_01')])).toBeUndefined();
  });
});
