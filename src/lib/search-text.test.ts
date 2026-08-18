import { describe, expect, it } from 'vitest';
import { normalizeSearchText } from '@/lib/search-text';

/**
 * Cette normalisation est appliquée DEUX FOIS : sur les termes de l'index
 * (serveur) et sur la saisie de la palette (client). Les cas ci-dessous fixent
 * ce que les deux côtés doivent produire à l'identique.
 */
describe('normalizeSearchText', () => {
  it('replie casse et diacritiques', () => {
    expect(normalizeSearchText('Éclair')).toBe('eclair');
    expect(normalizeSearchText('  Ame  ')).toBe('ame');
  });

  it('replie les formes pleine chasse (noms jp/zh)', () => {
    expect(normalizeSearchText('Ａｍｅ')).toBe('ame');
  });

  it('laisse intacts les scripts non latins', () => {
    expect(normalizeSearchText('提提娅')).toBe('提提娅');
  });
});
