import { describe, expect, it } from 'vitest';
import { normalizeSearchText } from '@/lib/search-text';
import { characterSearchNames } from '@/lib/data/characters';

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

  it('replie la pleine chasse en casse comme en espaces', () => {
    expect(normalizeSearchText('ＡＭＥ')).toBe('ame');
    expect(normalizeSearchText('\u3000Ame\u3000')).toBe('ame');
  });

  it('replie le katakana demi-chasse (ce que NFKC faisait pour les browsers)', () => {
    expect(normalizeSearchText('ｱﾒ')).toBe(normalizeSearchText('アメ'));
  });

  it('replie le dakuten comme un accent : « カ » trouve « ガ »', () => {
    expect(normalizeSearchText('ガ')).toBe(normalizeSearchText('カ'));
    expect(normalizeSearchText('ｶﾞ')).toBe(normalizeSearchText('ガ'));
  });

  it('garde le hangul cherchable par sous-chaîne (décomposé en jamo des deux côtés)', () => {
    expect(normalizeSearchText('가디언').includes(normalizeSearchText('가디'))).toBe(true);
  });
});

/**
 * Côté index des browsers : `characterSearchNames` et la saisie passent par la
 * même fonction, sinon une recherche accentuée (ou non) ne matche plus.
 */
describe('characterSearchNames ↔ saisie', () => {
  const names = characterSearchNames(
    { id: '2000001', name: { en: 'Éclair' }, nickname: undefined } as Parameters<
      typeof characterSearchNames
    >[0],
    ['Ｆｕｌｌ', '  Spaced  '],
  );
  const matches = (input: string) => {
    const needle = normalizeSearchText(input);
    return names.some((n) => n.includes(needle));
  };

  it('trouve un nom accentué avec ou sans accent, en toute casse', () => {
    expect(matches('eclair')).toBe(true);
    expect(matches('ÉCLAIR')).toBe(true);
    expect(matches('  écl ')).toBe(true);
  });

  it('trouve un alias pleine chasse avec une saisie ASCII, et inversement', () => {
    expect(matches('full')).toBe(true);
    expect(matches('ＥＣＬ')).toBe(true);
  });

  it('range les noms rognés, sans doublon', () => {
    expect(names).toContain('spaced');
    expect(new Set(names).size).toBe(names.length);
  });
});
