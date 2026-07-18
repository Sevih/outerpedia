import { describe, expect, it } from 'vitest';
import type { TFunction, TranslationKey } from '@/i18n';
import { resolveSectionTitle, type SectionTitle } from '@/lib/data/guide-sections';

// `t` factice : rend la clé et la variable `name` pour observer le gabarit choisi.
const t: TFunction = (key: TranslationKey, vars?: Record<string, string | number>) =>
  vars?.name !== undefined ? `${key}|${vars.name}` : key;

const resolve = (spec: SectionTitle, kind: 'tips' | 'team' = 'tips') =>
  resolveSectionTitle(spec, kind, 'en', t, 'test');

describe('resolveSectionTitle', () => {
  it('échappatoire `title` : rend le texte localisé tel quel', () => {
    expect(resolve({ title: { en: 'Custom Heading' } })).toBe('Custom Heading');
  });

  it('préréglage valide → clé i18n `guides.tips.<preset>`', () => {
    expect(resolve({ preset: 'strategy' })).toBe('guides.tips.strategy');
  });

  it('préréglage inconnu → JETTE (erreur de contenu)', () => {
    expect(() => resolve({ preset: 'bogus' as never })).toThrow(/préréglage/);
  });

  it('gabarit `tips` vs `team` choisit la bonne clé, avec le sujet en variable', () => {
    expect(resolve({ element: 'fire' }, 'tips')).toMatch(/^guides\.tips\.for\|/);
    expect(resolve({ element: 'fire' }, 'team')).toMatch(/^guides\.team\.for\|/);
  });

  it('élément inconnu → JETTE', () => {
    expect(() => resolve({ element: '__nope__' })).toThrow(/élément/);
  });

  it('personnage introuvable → JETTE', () => {
    expect(() => resolve({ character: '__NoSuchHero__' })).toThrow(/introuvable/);
  });
});
