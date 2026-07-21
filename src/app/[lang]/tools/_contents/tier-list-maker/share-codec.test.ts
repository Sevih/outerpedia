/**
 * Tests du codec de partage. Le format de fil `z` est un CONTRAT PUBLIC :
 * des liens V2 circulent (Discord, forums) et doivent se décoder ici — d'où
 * le test d'épinglage octet-à-octet, qui doit casser si on touche au format.
 */
import { describe, expect, it } from 'vitest';
import { TIER_PALETTE, buildCanon, decodeState, encodeState, type Tier } from './share-codec';

const chars = ['c2000001', 'c2000002', 'c2000003', 'c2000010', 'c2010002'].map((key) => ({ key }));
const ee = ['e2000001', 'e2000002', 'e2000003'].map((key) => ({ key }));
const bosses = ['b4001801', 'b4013071'].map((key) => ({ key }));
const canon = buildCanon(chars, ee, bosses);

function tier(label: string, items: string[], color = TIER_PALETTE[0]): Tier {
  return { id: `id-${label}`, label, color, items };
}

describe('buildCanon', () => {
  it('trie chaque type par id numérique et indexe en retour', () => {
    const shuffled = buildCanon(
      [{ key: 'c2000010' }, { key: 'c2000001' }, { key: 'c2010002' }],
      [],
      [],
    );
    expect(shuffled.byType[0].map((i) => i.key)).toEqual(['c2000001', 'c2000010', 'c2010002']);
    expect(shuffled.index.get('c2000010')).toEqual({ type: 0, idx: 1 });
  });
});

describe('encode / decode', () => {
  it('aller-retour mono-type (titre unicode, couleur personnalisée)', () => {
    const tiers = [
      tier('S 日本語', ['c2000003', 'c2000001'], '#123abc'),
      tier('A é', ['c2010002'], TIER_PALETTE[3]),
      tier('B', []),
    ];
    const z = encodeState('Ma liste préférée', tiers, canon);
    expect(z[0]).toBe('1');
    expect(z).not.toMatch(/[%+]/);
    const decoded = decodeState(z, canon)!;
    expect(decoded.title).toBe('Ma liste préférée');
    expect(decoded.tiers.map((t) => t.label)).toEqual(['S 日本語', 'A é', 'B']);
    expect(decoded.tiers.map((t) => t.color)).toEqual([
      '#123abc',
      TIER_PALETTE[3],
      TIER_PALETTE[0],
    ]);
    expect(decoded.tiers.map((t) => t.items)).toEqual([['c2000003', 'c2000001'], ['c2010002'], []]);
  });

  it('aller-retour types mêlés (mode 3)', () => {
    const tiers = [tier('S', ['c2000001', 'e2000002']), tier('A', ['b4013071'])];
    const decoded = decodeState(encodeState('', tiers, canon), canon)!;
    expect(decoded.tiers.map((t) => t.items)).toEqual([['c2000001', 'e2000002'], ['b4013071']]);
  });

  it('liste vierge : tiers vides, labels et couleurs conservés', () => {
    const tiers = [tier('S', []), tier('A', [])];
    const decoded = decodeState(encodeState('', tiers, canon), canon)!;
    expect(decoded.title).toBe('');
    expect(decoded.tiers.map((t) => t.items)).toEqual([[], []]);
    expect(decoded.tiers.map((t) => t.label)).toEqual(['S', 'A']);
  });

  it('entrées illisibles → null', () => {
    expect(decodeState(null, canon)).toBeNull();
    expect(decodeState('', canon)).toBeNull();
    expect(decodeState('2abc,def', canon)).toBeNull();
    expect(decodeState('1seul-segment', canon)).toBeNull();
    expect(decodeState('1a,b,c', canon)).toBeNull(); // longueur impaire
  });

  it('ÉPINGLAGE du format de fil (compat liens V2 — ne doit JAMAIS changer)', () => {
    const tiers = [
      tier('S', ['c2000002', 'c2000001'], TIER_PALETTE[0]),
      tier('A', ['e2000003'], '#0a1b2c'),
    ];
    // Généré par ce codec (portage à l'identique de l'encodeur V2) puis figé :
    // toute évolution du format casse ce test — c'est voulu.
    expect(encodeState('Pin', tiers, canon)).toBe('1UGlu,Uw,p0,QQ,c0a1b2c,wEAQAgAQEA');
    const decoded = decodeState(encodeState('Pin', tiers, canon), canon)!;
    expect(decoded.tiers[0].items).toEqual(['c2000002', 'c2000001']);
    expect(decoded.tiers[1].items).toEqual(['e2000003']);
    expect(decoded.tiers[1].color).toBe('#0a1b2c');
  });
});
