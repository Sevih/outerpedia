import { describe, expect, it } from 'vitest';
import { DEFAULT_LANG, isValidLang, normalizeLang } from '@/lib/i18n/config';
import { isGuideCategory, isGuideTier } from '@/lib/data/guide-categories';
import { isTowerKey } from '@/lib/data/towers';
import { getToolMeta } from '@/lib/data/tools';

// Les gardes sur objets littéraux doivent refuser les noms de la chaîne de
// prototype : `'constructor' in {}` est vrai, et `/constructor` faisait 500.
const PROTO_NAMES = ['constructor', 'toString', '__proto__', 'hasOwnProperty', 'valueOf'];

describe('gardes de type — noms de la chaîne de prototype', () => {
  it('isValidLang accepte les langues et refuse le reste', () => {
    expect(isValidLang('en')).toBe(true);
    expect(isValidLang('jp')).toBe(true);
    for (const n of PROTO_NAMES) expect(isValidLang(n), n).toBe(false);
    expect(isValidLang('')).toBe(false);
  });

  it('normalizeLang replie ces noms sur la langue par défaut', () => {
    for (const n of PROTO_NAMES) expect(normalizeLang(n)).toBe(DEFAULT_LANG);
  });

  it('les autres gardes suivent la même règle', () => {
    for (const n of PROTO_NAMES) {
      expect(isGuideCategory(n), n).toBe(false);
      expect(isGuideTier(n), n).toBe(false);
      expect(isTowerKey(n), n).toBe(false);
      expect(getToolMeta(n), n).toBeNull();
    }
  });
});
