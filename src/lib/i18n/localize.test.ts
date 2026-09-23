import { describe, expect, it } from 'vitest';
import { lRec } from './localize';

/**
 * Le repli anglais de `lRec` — la règle vaut pour trois formes de donnée :
 * le dict complet du jeu, le curé partiel, et l'entité RETENUE après son
 * retrait du jeu (dict complété à vide pour les langues apparues depuis,
 * cf. `promote.completeLangDicts`).
 */
describe('lRec — repli anglais', () => {
  it('rend la langue demandée quand elle est là', () => {
    expect(lRec({ en: 'Attack', fr: 'ATQ' }, 'fr')).toBe('ATQ');
  });

  it('replie sur en quand la langue MANQUE (curé partiel)', () => {
    expect(lRec({ en: 'Attack' }, 'es')).toBe('Attack');
  });

  it('replie sur en quand la langue est VIDE (entité retenue) — un blanc n’est pas une traduction', () => {
    expect(lRec({ en: 'World Boss Ragnakeus', fr: '', es: '' }, 'fr')).toBe('World Boss Ragnakeus');
  });

  it('rien du tout → chaîne vide, jamais undefined', () => {
    expect(lRec(undefined, 'en')).toBe('');
    expect(lRec({}, 'jp')).toBe('');
  });
});
