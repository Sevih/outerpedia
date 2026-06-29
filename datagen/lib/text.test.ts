import { describe, expect, it } from 'vitest';
import { emptyDict, getLangTexts, langDict, resolveText } from './text';
import type { LangDict } from './lang';
import type { Row } from './tables';

const row: Row = {
  ID: 'SYS_HELLO',
  Korean: '안녕',
  English: '  Hello’s  ', // espaces + apostrophe courbe → à normaliser
  Japanese: 'こんにちは',
  China_Simplified: '你好',
  China_Traditional: '你好', // colonne ignorée (zh = simplifié)
};

describe('getLangTexts', () => {
  it('extrait les 4 langues officielles et normalise', () => {
    const d = getLangTexts(row);
    expect(d).toEqual({
      en: "Hello's", // trim + apostrophe droite
      jp: 'こんにちは',
      kr: '안녕',
      zh: '你好',
    } satisfies LangDict);
  });

  it('renvoie null pour une ligne absente', () => {
    expect(getLangTexts(undefined)).toBeNull();
  });
});

describe('langDict', () => {
  it('renvoie un dict vide pour une ligne absente', () => {
    expect(langDict(undefined)).toEqual(emptyDict());
  });
});

describe('resolveText', () => {
  const index = new Map<string, LangDict>([['SYS_HELLO', getLangTexts(row)!]]);

  it('résout une clé connue', () => {
    expect(resolveText(index, 'SYS_HELLO').en).toBe("Hello's");
  });

  it('clé absente / vide → dict vide', () => {
    expect(resolveText(index, 'SYS_MISSING')).toEqual(emptyDict());
    expect(resolveText(index, undefined)).toEqual(emptyDict());
    expect(resolveText(index, '')).toEqual(emptyDict());
  });
});
