import { describe, expect, it } from 'vitest';
import { checkText, parseText, type ParseCtx } from '@/lib/parse-text';
import type { TFunction } from '@/i18n';

const ctx: ParseCtx = { lang: 'en', t: ((k: string) => k) as TFunction };

describe('parseText — références inconnues', () => {
  it('mode tolérant : rend le texte (marqueur rouge), sans lever', () => {
    expect(() => parseText('avant {B/CLE_INEXISTANTE} après', ctx)).not.toThrow();
    expect(() => parseText('{P/Personnage Inexistant}', ctx)).not.toThrow();
    expect(() => parseText('{ZZZ/tag inconnu}', ctx)).not.toThrow();
  });

  it('mode STRICT (guides) : lève avec la référence fautive dans le message', () => {
    const strict: ParseCtx = { ...ctx, strict: true };
    expect(() => parseText('avant {B/CLE_INEXISTANTE} après', strict)).toThrow(
      /\{B\/CLE_INEXISTANTE\}/,
    );
    expect(() => parseText('{P/Personnage Inexistant}', strict)).toThrow(
      /\{P\/Personnage Inexistant\}/,
    );
    expect(() => parseText('{I-I/Objet Inexistant}', strict)).toThrow(/\{I-I\/Objet Inexistant\}/);
    expect(() => parseText('{ZZZ/tag inconnu}', strict)).toThrow(/\{ZZZ\/tag inconnu\}/);
  });

  it('mode STRICT : une référence VALIDE ne lève pas', () => {
    const strict: ParseCtx = { ...ctx, strict: true };
    expect(() => parseText('{E/Fire} et {C/Healer}', strict)).not.toThrow();
  });
});

describe('checkText — cibles internes des liens {L}', () => {
  // Validateur factice : seul /guides/ok/live existe.
  const guideHrefExists = (href: string) => href === '/guides/ok/live';
  const okOf = (text: string, opts?: Parameters<typeof checkText>[1]) =>
    checkText(text, opts).find((c) => c.type === 'L')?.ok;

  it('un lien /guides/... MORT échoue quand le validateur est fourni', () => {
    expect(okOf('{L/Lien mort|/guides/ok/dead}', { guideHrefExists })).toBe(false);
  });

  it('un lien /guides/... VIVANT passe', () => {
    expect(okOf('{L/Lien vivant|/guides/ok/live}', { guideHrefExists })).toBe(true);
  });

  it('sans validateur, aucun lien {L} n’est bloqué (rendu runtime)', () => {
    expect(okOf('{L/Lien mort|/guides/ok/dead}')).toBe(true);
  });

  it('les liens externes / ancres / label seul passent, validateur ou non', () => {
    expect(okOf('{L/Externe|https://example.com}', { guideHrefExists })).toBe(true);
    expect(okOf('{L/Ancre|#section}', { guideHrefExists })).toBe(true);
    expect(okOf('{L/Sans lien}', { guideHrefExists })).toBe(true);
  });
});
