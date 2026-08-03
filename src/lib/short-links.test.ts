import { describe, expect, it } from 'vitest';
import { isInternalPath, pathId, ID_RE, MAX_PATH } from '@/lib/short-links';

/**
 * `short-links.ts` — le cœur du raccourcisseur est sa VALIDATION : `/s/[id]`
 * émet une redirection vers ce que `isInternalPath` a laissé entrer, chaque
 * trou ici est un open redirect en prod. Les cas refusés listés viennent des
 * vecteurs classiques de contournement, pas d'hypothèses.
 */

describe('isInternalPath — chemins internes acceptés', () => {
  it('accepte les chemins réels du site, query et fragment compris', () => {
    expect(isInternalPath('/')).toBe(true);
    expect(isInternalPath('/characters/ame')).toBe(true);
    expect(isInternalPath('/tier-list-maker?z=1AbC-_dEf')).toBe(true);
    expect(isInternalPath('/guides/guild-raid#season-47')).toBe(true);
    expect(isInternalPath('/jp/tools/progress-tracker')).toBe(true);
  });

  it('refuse tout ce qui peut sortir du site (open redirect)', () => {
    expect(isInternalPath('https://evil.com/x')).toBe(false);
    expect(isInternalPath('//evil.com/x')).toBe(false); // protocol-relative
    expect(isInternalPath('/\\evil.com')).toBe(false); // \ normalisé en / par les navigateurs
    expect(isInternalPath('javascript:alert(1)')).toBe(false);
    expect(isInternalPath('evil.com')).toBe(false); // pas de / initial
  });

  it('refuse espaces, contrôles et non-ASCII (en-tête Location sain)', () => {
    expect(isInternalPath('/a b')).toBe(false);
    expect(isInternalPath('/a\nb')).toBe(false);
    expect(isInternalPath('/a\tb')).toBe(false);
    expect(isInternalPath('/héros')).toBe(false); // les chemins réels sont déjà percent-encodés
    expect(isInternalPath('')).toBe(false);
  });

  it('borne la longueur à MAX_PATH', () => {
    expect(isInternalPath('/' + 'a'.repeat(MAX_PATH - 1))).toBe(true);
    expect(isInternalPath('/' + 'a'.repeat(MAX_PATH))).toBe(false);
  });
});

describe('pathId — id déterministe', () => {
  it('même chemin ⇒ même id, chemins différents ⇒ ids différents', () => {
    expect(pathId('/tools/x?z=abc')).toBe(pathId('/tools/x?z=abc'));
    expect(pathId('/tools/x?z=abc')).not.toBe(pathId('/tools/x?z=abd'));
  });

  it("l'id produit matche ID_RE (le GET le revalidera tel quel)", () => {
    expect(pathId('/characters/ame')).toMatch(ID_RE);
    expect(pathId('/')).toMatch(ID_RE);
  });
});
