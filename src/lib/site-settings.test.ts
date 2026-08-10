import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readStored } from './client-storage';
import {
  clearAllSkins,
  coerceSiteSettings,
  resetSiteSettingsForTests,
  setAnimatedPortraits,
  setSkin,
  SITE_SETTINGS_SPEC,
} from './site-settings';

/** Stub localStorage + le minimum de `window` que le store touche. */
function stubStorage(): Map<string, string> {
  const map = new Map<string, string>();
  const ls = {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
  vi.stubGlobal('window', {
    localStorage: ls,
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  return map;
}

beforeEach(() => {
  vi.unstubAllGlobals();
  resetSiteSettingsForTests();
});

describe('coerceSiteSettings', () => {
  it('donnée illisible → forme du fallback', () => {
    expect(coerceSiteSettings(undefined)).toEqual({ animatedPortraits: false, skins: {} });
    expect(coerceSiteSettings('n’importe quoi')).toEqual({ animatedPortraits: false, skins: {} });
    expect(coerceSiteSettings(42)).toEqual({ animatedPortraits: false, skins: {} });
  });

  it('valeur conforme → inchangée', () => {
    expect(
      coerceSiteSettings({ animatedPortraits: true, skins: { '2000063': '2010063' } }),
    ).toEqual({ animatedPortraits: true, skins: { '2000063': '2010063' } });
  });

  it('animatedPortraits : seul le littéral true compte', () => {
    expect(coerceSiteSettings({ animatedPortraits: 'true' }).animatedPortraits).toBe(false);
    expect(coerceSiteSettings({ animatedPortraits: 1 }).animatedPortraits).toBe(false);
  });

  it('skins : ids non numériques, valeurs non-chaînes et modèle = base retirés', () => {
    expect(
      coerceSiteSettings({
        skins: {
          '2000063': '2010063', // valide
          abc: '2010012', // clé forgée
          '2000012': 42, // valeur forgée
          '2000084': '2000084', // modèle = base : le défaut ne se stocke pas
        },
      }).skins,
    ).toEqual({ '2000063': '2010063' });
  });
});

describe('le store', () => {
  it('setSkin écrit en write-through sous la clé versionnée', () => {
    stubStorage();
    setSkin('2000063', '2010063');
    expect(readStored(SITE_SETTINGS_SPEC)).toEqual({
      animatedPortraits: false,
      skins: { '2000063': '2010063' },
    });
  });

  it('setSkin(null) et modèle = base retirent l’entrée', () => {
    stubStorage();
    setSkin('2000063', '2010063');
    setSkin('2000063', null);
    expect(readStored(SITE_SETTINGS_SPEC).skins).toEqual({});
    setSkin('2000063', '2010063');
    setSkin('2000063', '2000063');
    expect(readStored(SITE_SETTINGS_SPEC).skins).toEqual({});
  });

  it('la première mutation lit d’abord la valeur stockée (pas d’écrasement)', () => {
    const map = stubStorage();
    map.set(
      SITE_SETTINGS_SPEC.key,
      JSON.stringify({ v: 1, data: { animatedPortraits: false, skins: { '2000012': '2010012' } } }),
    );
    setAnimatedPortraits(true);
    expect(readStored(SITE_SETTINGS_SPEC)).toEqual({
      animatedPortraits: true,
      skins: { '2000012': '2010012' },
    });
  });

  it('clearAllSkins vide la table sans toucher au reste', () => {
    stubStorage();
    setAnimatedPortraits(true);
    setSkin('2000063', '2010063');
    clearAllSkins();
    expect(readStored(SITE_SETTINGS_SPEC)).toEqual({ animatedPortraits: true, skins: {} });
  });
});
