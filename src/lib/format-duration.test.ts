import { describe, expect, it } from 'vitest';
import { makeT } from '@/i18n';
import en from '@/i18n/locales/en';
import es from '@/i18n/locales/es';
import fr from '@/i18n/locales/fr';
import jp from '@/i18n/locales/jp';
import kr from '@/i18n/locales/kr';
import zh from '@/i18n/locales/zh';
import { durationUnits, formatDuration } from './format-duration';

const H = 3_600_000;
const M = 60_000;
const D = 24 * H;
const EN = durationUnits(makeT(en));

describe('formatDuration', () => {
  it('0 jour : part de la plus grande unité non nulle', () => {
    expect(formatDuration(4 * H + 12 * M, EN)).toBe('4h 12m');
    expect(formatDuration(12 * M, EN)).toBe('12m');
    expect(formatDuration(0, EN)).toBe('0m');
    expect(formatDuration(-5000, EN)).toBe('0m');
    expect(formatDuration(0, EN, { seconds: true })).toBe('0s');
  });

  it('1 jour : les zéros intermédiaires restent affichés', () => {
    expect(formatDuration(D, EN)).toBe('1d 0h 0m');
    expect(formatDuration(D + 5 * M, EN)).toBe('1d 0h 5m');
    expect(formatDuration(2 * D + 4 * H + 12 * M, EN)).toBe('2d 4h 12m');
  });

  it('arrondi des minutes : troncature, jamais une minute de trop', () => {
    expect(formatDuration(M - 1, EN)).toBe('0m');
    expect(formatDuration(2 * M - 1, EN)).toBe('1m');
    expect(formatDuration(H - 1, EN)).toBe('59m');
    expect(formatDuration(2 * M - 1, EN, { seconds: true })).toBe('1m 59s');
  });

  it('`maxUnits` et `seconds` : les formes des quatre sites', () => {
    const t = 1 * D + 3 * H + 7 * M + 9000;
    // Bannière : deux unités, sans secondes.
    expect(formatDuration(t, EN, { maxUnits: 2 })).toBe('1d 3h');
    expect(formatDuration(3 * H + 7 * M + 9000, EN, { maxUnits: 2 })).toBe('3h 7m');
    // Resets serveur : trois unités jusqu'aux secondes.
    expect(formatDuration(t, EN, { seconds: true })).toBe('1d 3h 7m');
    expect(formatDuration(3 * H + 7 * M + 9000, EN, { seconds: true })).toBe('3h 7m 9s');
    // Buff du jour : deux unités jusqu'aux secondes.
    expect(formatDuration(3 * H + 7 * M + 9000, EN, { seconds: true, maxUnits: 2 })).toBe('3h 7m');
    expect(formatDuration(7 * M + 9000, EN, { seconds: true, maxUnits: 2 })).toBe('7m 9s');
  });

  it('chaque langue', () => {
    const t = 3 * D + 4 * H + 12 * M + 5000;
    const cases = [
      [en, '3d 4h 12m', '12m 5s'],
      [fr, '3j 4h 12min', '12min 5s'],
      [es, '3d 4h 12min', '12min 5s'],
      [jp, '3日 4時間 12分', '12分 5秒'],
      [kr, '3일 4시간 12분', '12분 5초'],
      [zh, '3天 4小时 12分', '12分 5秒'],
    ] as const;
    for (const [dict, long, short] of cases) {
      const units = durationUnits(makeT(dict));
      expect(formatDuration(t, units)).toBe(long);
      expect(formatDuration(12 * M + 5000, units, { seconds: true })).toBe(short);
    }
  });
});
