import { describe, expect, it } from 'vitest';
import type { Glossaries } from '@contracts';
import glossariesData from '@data/generated/glossaries.json';
import { splitGameTokens, type GameToken } from '@/lib/game-tokens';

const G = glossariesData as unknown as Glossaries;
const tokens = (parts: (string | GameToken)[]) =>
  parts.filter((p): p is GameToken => typeof p !== 'string');

describe('splitGameTokens — reconnaissance des mentions d’élément/classe', () => {
  it('reconnaît un nom d’élément et porte son slug + sa nature', () => {
    const parts = splitGameTokens('Deals damage to Water enemies', 'en');
    const t = tokens(parts);
    expect(t).toHaveLength(1);
    expect(t[0]).toMatchObject({ kind: 'element', slug: 'water', text: 'Water' });
  });

  it('reconnaît un nom de classe', () => {
    const t = tokens(splitGameTokens('if the target is a Defender', 'en'));
    expect(t).toHaveLength(1);
    expect(t[0]).toMatchObject({ kind: 'class', slug: 'defender' });
  });

  it('FRONTIÈRE LATINE : « Fire » ne matche pas dans « Firefly »', () => {
    expect(tokens(splitGameTokens('A Firefly appears', 'en'))).toHaveLength(0);
  });

  it('préserve le texte hors token (reconstruction fidèle)', () => {
    const parts = splitGameTokens('to Water enemies', 'en');
    expect(parts.map((p) => (typeof p === 'string' ? p : p.text)).join('')).toBe(
      'to Water enemies',
    );
  });

  it('un texte sans mention reste un seul fragment brut', () => {
    expect(splitGameTokens('plain sentence here', 'en')).toEqual(['plain sentence here']);
  });

  it('IDÉOGRAMMES : reconnaît une mention CJK sans frontière de mot', () => {
    // Le nom JP de l'élément eau, résolu du glossaire (pas codé en dur).
    const waterJp = G.elements?.water?.jp;
    if (!waterJp) return; // glossaire sans JP → rien à prouver
    const t = tokens(splitGameTokens(`敵${waterJp}に`, 'jp'));
    expect(t.some((tok) => tok.slug === 'water')).toBe(true);
  });
});
