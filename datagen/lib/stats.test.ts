import { describe, expect, it } from 'vitest';
import { formatStatValue } from './stats';

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
