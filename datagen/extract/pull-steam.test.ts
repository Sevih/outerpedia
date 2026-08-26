/**
 * Cœur PUR de la sync Steam, testé sans jeu : `syncPlan` (copier / supprimer)
 * et la reconnaissance des bundles content-addressed. Le garde anti-purge est
 * celui du pull Android (`massDeleteGuard`, testé là-bas).
 */
import { describe, expect, it } from 'vitest';
import { isContentAddressed, syncPlan } from './pull-steam';

describe('isContentAddressed', () => {
  it('32 hexa = bundle (signature par taille) ; le reste par md5', () => {
    expect(isContentAddressed('000c4407ac1d6a2d4c6a9c8f59f62414')).toBe(true);
    expect(isContentAddressed('manifest.dat')).toBe(false);
    expect(isContentAddressed('crc.txt')).toBe(false);
    expect(isContentAddressed('Assembly-CSharp.dll')).toBe(false);
  });
});

describe('syncPlan — diff source → miroir', () => {
  const source = new Map([
    ['aaa', '10'],
    ['bbb', '20'],
    ['manifest.dat', 'md5-new'],
  ]);

  it('copie ce qui manque ou diffère, supprime ce qui a disparu', () => {
    const local = new Map([
      ['aaa', '10'],
      ['manifest.dat', 'md5-old'],
      ['zzz', '5'],
    ]);
    expect(syncPlan(source, local)).toEqual({ toCopy: ['bbb', 'manifest.dat'], toDelete: ['zzz'] });
  });

  it('miroir identique → rien à faire', () => {
    expect(syncPlan(source, new Map(source))).toEqual({ toCopy: [], toDelete: [] });
  });

  it('miroir vide (bootstrap) → tout copier, rien à supprimer', () => {
    expect(syncPlan(source, new Map()).toCopy).toEqual([...source.keys()]);
  });
});
