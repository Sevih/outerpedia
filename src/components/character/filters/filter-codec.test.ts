/**
 * Tests du codec `?z=` des filtres de `/characters`. Le format est un CONTRAT
 * PUBLIC (liens V2 en circulation) : le test « format V2 brut » construit le
 * payload compact à la main — indépendamment de notre encodeur — et vérifie
 * qu'il décode vers les slugs V3 ; l'ÉPINGLAGE fige l'encodage octet à octet.
 */
import LZString from 'lz-string';
import { describe, expect, it } from 'vitest';
import { decodeFilters, encodeFilters, type FilterState } from './filter-codec';

const EMPTY: FilterState = {
  q: '',
  element: [],
  klass: [],
  rarity: [],
  chain: [],
  gift: [],
  role: [],
  tags: [],
  tagLogic: 'OR',
  buffs: [],
  debuffs: [],
  effectLogic: 'OR',
  sources: [],
  showUnique: false,
  teamBonuses: [],
};

describe('encodeFilters', () => {
  it('état vide → undefined (URL nue)', () => {
    expect(encodeFilters(EMPTY)).toBeUndefined();
  });

  it('aller-retour complet (toutes les facettes)', () => {
    const state: FilterState = {
      q: 'luna',
      element: ['fire', 'earth'],
      klass: ['striker', 'mage'],
      rarity: [3],
      chain: ['join'],
      gift: ['present_03'],
      role: ['support'],
      tags: ['premium', 'core-fusion'],
      tagLogic: 'AND',
      buffs: ['BT_STAT|ST_ATK', 'POLAR_NIGHT'],
      debuffs: ['BT_STUN'],
      effectLogic: 'AND',
      sources: ['s1', 'chainPassive'],
      showUnique: true,
      teamBonuses: ['SPD', 'ATK'],
    };
    const z = encodeFilters(state)!;
    // L'alphabet lz-string URI-safe contient `+` : URLSearchParams le rend en
    // espace, que `decompressFromEncodedURIComponent` re-transforme en `+` —
    // l'aller-retour par la barre d'adresse doit donc survivre tel quel.
    expect(decodeFilters(new URLSearchParams(`z=${z}`).get('z'))).toEqual(state);
    expect(decodeFilters(z)).toEqual(state);
  });

  it('clé SANS indice gelé → champ d’extension, aller-retour intact', () => {
    const state: FilterState = {
      ...EMPTY,
      buffs: ['BT_STAT|ST_ATK', 'FUTUR_EFFET_INCONNU'],
      tags: ['nouveau-tag'],
    };
    const decoded = decodeFilters(encodeFilters(state)!)!;
    expect(decoded.buffs).toEqual(['BT_STAT|ST_ATK', 'FUTUR_EFFET_INCONNU']);
    expect(decoded.tags).toEqual(['nouveau-tag']);
  });

  it('ÉPINGLAGE du format de fil (compat liens — ne doit JAMAIS changer)', () => {
    const state: FilterState = {
      ...EMPTY,
      q: 'Pin',
      element: ['water'],
      klass: ['defender'],
      buffs: ['BT_IMMUNE'],
      teamBonuses: ['SPD'],
    };
    // Généré par ce codec (format V2 à l'identique) puis figé : toute évolution
    // du format casse ce test — c'est voulu.
    expect(encodeFilters(state)).toBe('N4IgpiBcBMA0IGMpxAIygbQMwEYC68AjlCAAoCWAdiPAC7qQ4C+QA');
  });
});

describe('decodeFilters — format V2 brut', () => {
  /** Compresse un payload compact V2 écrit à la main (sans passer par l'encodeur). */
  const v2z = (payload: Record<string, unknown>) =>
    LZString.compressToEncodedURIComponent(JSON.stringify(payload));

  it('bitfields V2 → slugs V3 (mêmes positions de bits)', () => {
    // V2 : e=5 (Fire|Earth), c=1 (Striker), r=1 (1★), ch=2 (Join), g=4
    // (Magic Tool), r2=2 (support), src=9 (SKT_FIRST|SKT_CHAIN_PASSIVE),
    // tb=3 (SPD|ATK), u=1.
    const decoded = decodeFilters(
      v2z({ e: 5, c: 1, r: 1, ch: 2, g: 4, r2: 2, src: 9, tb: 3, u: 1, q: 'ml' }),
    )!;
    expect(decoded.element).toEqual(['fire', 'earth']);
    expect(decoded.klass).toEqual(['striker']);
    expect(decoded.rarity).toEqual([1]);
    expect(decoded.chain).toEqual(['join']);
    expect(decoded.gift).toEqual(['present_03']);
    expect(decoded.role).toEqual(['support']);
    expect(decoded.sources).toEqual(['s1', 'chainPassive']);
    expect(decoded.teamBonuses).toEqual(['SPD', 'ATK']);
    expect(decoded.showUnique).toBe(true);
    expect(decoded.q).toBe('ml');
  });

  it('indices d’effets/tags V2 → clés canoniques, variantes repliées + dédup', () => {
    // b: 16 = CRITICAL_DMG_RATE, 17 = sa variante _IR → même canonique (dédup) ;
    // d: 60 et 61 = BT_STUN et sa variante ; t: 2 = premium, 7 = core-fusion.
    const decoded = decodeFilters(v2z({ b: [16, 17], d: [60, 61], t: [2, 7], l: 1, tl: 1 }))!;
    expect(decoded.buffs).toEqual(['BT_STAT|ST_CRITICAL_DMG_RATE']);
    expect(decoded.debuffs).toEqual(['BT_STUN']);
    expect(decoded.tags).toEqual(['premium', 'core-fusion']);
    expect(decoded.effectLogic).toBe('AND');
    expect(decoded.tagLogic).toBe('AND');
  });

  it('entrées illisibles → null', () => {
    expect(decodeFilters(null)).toBeNull();
    expect(decodeFilters('')).toBeNull();
    expect(decodeFilters('pas-du-lz-string-!!!')).toBeNull();
  });
});
