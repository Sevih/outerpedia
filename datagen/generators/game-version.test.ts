/**
 * Tests du générateur game-version — son CŒUR PUR `parseResVersion`, qui extrait
 * `X.Y.Z` de la fin du `manifest.dat`. La lecture disque (`buildGameVersion`)
 * n'est qu'une fenêtre de 256 octets passée à ce cœur → seul le parsing est
 * testé, en synthétique. Un invariant léger valide la forme du JSON committé.
 *
 * Tourne SANS `.gamedata` : `parseResVersion` est pur (aucun fichier).
 */
import { describe, expect, it } from 'vitest';
import versionData from '../../data/generated/game-version.json';
import { parseResVersion } from './game-version';

describe('parseResVersion — version en fin de manifeste', () => {
  it('extrait la version d’un objet clos en fin de chaîne', () => {
    expect(parseResVersion('{"a":1,"version":"1.10.704"}')).toBe('1.10.704');
  });

  it('tolère les espaces autour de « : » et après « } »', () => {
    expect(parseResVersion('… "version" : "2.0.0" }  \n')).toBe('2.0.0');
  });

  it('ancré sur la FIN : un « version » plus haut ne compte pas', () => {
    // Seul le dernier objet clos est la version du manifeste.
    expect(parseResVersion('{"version":"9.9.9"},{"version":"1.2.3"}')).toBe('1.2.3');
  });

  it('rien en toute fin → null (données absentes, pas une valeur vide)', () => {
    expect(parseResVersion('{"version":"1.2.3"} et du bruit après')).toBeNull();
    expect(parseResVersion('aucune clé version ici')).toBeNull();
    expect(parseResVersion('')).toBeNull();
  });
});

describe('game-version.json — invariant de forme', () => {
  it('resVersion présent, non vide', () => {
    expect((versionData as { resVersion?: string }).resVersion).toBeTruthy();
  });
});
