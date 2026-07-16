import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readHashParam, writeHashParam } from '@/lib/url-hash';

/**
 * Le hash-comme-jeu-de-paramètres (`#version=x&team=1`) est le deep-link des
 * guides récurrents : une régression ici casse silencieusement les liens
 * partagés (paramètre perdu à l'écriture, décodage faux). Environnement node →
 * on stubbe le strict nécessaire de `window` : location.hash mutable,
 * replaceState qui l'écrit, dispatchEvent absorbé (l'événement de synchro
 * useUrlSlice est testé par ailleurs via les composants).
 */
const fakeWindow = {
  location: { hash: '' },
  history: {
    replaceState: (_state: unknown, _title: string, url: string) => {
      fakeWindow.location.hash = url;
    },
  },
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {},
};
vi.stubGlobal('window', fakeWindow);

beforeEach(() => {
  fakeWindow.location.hash = '';
});

describe('readHashParam', () => {
  it('absent → null (hash vide comme paramètre manquant)', () => {
    expect(readHashParam('version')).toBeNull();
    fakeWindow.location.hash = '#version=jun2026';
    expect(readHashParam('team')).toBeNull();
  });

  it('lit sa tranche parmi plusieurs paramètres', () => {
    fakeWindow.location.hash = '#version=jun2026&phase=p2&team=1';
    expect(readHashParam('version')).toBe('jun2026');
    expect(readHashParam('phase')).toBe('p2');
    expect(readHashParam('team')).toBe('1');
  });

  it('rétrocompatible : le hash mono-paramètre des anciens liens', () => {
    fakeWindow.location.hash = '#version=may2025';
    expect(readHashParam('version')).toBe('may2025');
  });

  it('segments malformés ignorés (pas de =, segment vide)', () => {
    fakeWindow.location.hash = '#scrollTo&&version=x';
    expect(readHashParam('scrollTo')).toBeNull();
    expect(readHashParam('version')).toBe('x');
  });

  it('décode les valeurs encodées (la valeur peut contenir & ou =)', () => {
    fakeWindow.location.hash = '#q=a%26b%3Dc';
    expect(readHashParam('q')).toBe('a&b=c');
  });
});

describe('writeHashParam', () => {
  it('écrit sur hash vide', () => {
    writeHashParam('version', 'jun2026');
    expect(readHashParam('version')).toBe('jun2026');
  });

  it('préserve les autres paramètres (le contrat central du module)', () => {
    fakeWindow.location.hash = '#version=jun2026&phase=p2';
    writeHashParam('team', '2');
    expect(readHashParam('version')).toBe('jun2026');
    expect(readHashParam('phase')).toBe('p2');
    expect(readHashParam('team')).toBe('2');
  });

  it('remplace la valeur existante sans dupliquer la clé', () => {
    fakeWindow.location.hash = '#team=1&phase=p2';
    writeHashParam('team', '3');
    expect(readHashParam('team')).toBe('3');
    expect((fakeWindow.location.hash.match(/team=/g) ?? []).length).toBe(1);
  });

  it('aller-retour : les caractères spéciaux survivent à l’encodage', () => {
    writeHashParam('q', 'a&b=c #é');
    expect(readHashParam('q')).toBe('a&b=c #é');
  });
});
