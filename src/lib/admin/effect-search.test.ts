import { describe, expect, it } from 'vitest';
import { effectHaystack, effectMatches, filterEffectCatalog } from '@/lib/admin/effect-search';

const row = (id: string, name: Record<string, string>, keys: string[] = []) => ({
  id,
  haystack: effectHaystack({ id, keys, name }),
});

const atkUp = row(
  '7',
  { en: 'Increased Attack', fr: 'ATQ augmentée', jp: '攻撃力UP', kr: '공격력 증가' },
  ['BT_STAT|ST_ATK'],
);
const atkDown = row('107', { en: 'Reduced Attack', fr: 'ATQ réduite' }, ['BT_STAT|ST_ATK']);
const burn = row('1', { en: 'Burned', fr: 'Brûlé', zh: '烧伤' }, ['BT_DOT_BURN']);
const uncounterable = row('UNCOUNTERABLE', { en: 'Uncounterable' });

describe('effectMatches', () => {
  it('ignore la casse', () => {
    expect(effectMatches(burn.haystack, 'BURN')).toBe(true);
    expect(effectMatches(burn.haystack, 'burned')).toBe(true);
  });

  it('ignore les accents, dans la saisie comme dans le nom', () => {
    expect(effectMatches(burn.haystack, 'brule')).toBe(true);
    expect(effectMatches(burn.haystack, 'BRÛLÉ')).toBe(true);
    expect(effectMatches(atkUp.haystack, 'augmentee')).toBe(true);
  });

  it('trouve par clé BT_*, morceau de clé compris', () => {
    expect(effectMatches(atkUp.haystack, 'BT_STAT|ST_ATK')).toBe(true);
    expect(effectMatches(atkUp.haystack, 'st_atk')).toBe(true);
    expect(effectMatches(burn.haystack, 'bt_dot')).toBe(true);
    expect(effectMatches(burn.haystack, 'st_atk')).toBe(false);
  });

  it('trouve par nom dans une autre langue que l’anglais', () => {
    expect(effectMatches(atkUp.haystack, '攻撃力')).toBe(true);
    expect(effectMatches(atkUp.haystack, '공격력')).toBe(true);
    expect(effectMatches(burn.haystack, '烧伤')).toBe(true);
  });

  it('trouve par id', () => {
    expect(effectMatches(atkDown.haystack, '107')).toBe(true);
    expect(effectMatches(uncounterable.haystack, 'uncounter')).toBe(true);
  });

  it('ne recolle pas deux champs voisins', () => {
    // « 7 » puis « BT_STAT|ST_ATK » : la saisie « 7bt » n’est dans aucun champ.
    expect(effectMatches(atkUp.haystack, '7bt')).toBe(false);
  });

  it('garde tout sur une saisie vide ou blanche', () => {
    expect(effectMatches(burn.haystack, '')).toBe(true);
    expect(effectMatches(burn.haystack, '   ')).toBe(true);
  });
});

describe('filterEffectCatalog', () => {
  const catalog = {
    pairs: [{ buff: atkUp, debuff: atkDown }],
    orphanBuffs: [uncounterable],
    orphanDebuffs: [burn],
  };

  it('rend le catalogue tel quel sans saisie', () => {
    expect(filterEffectCatalog(catalog, ' ')).toBe(catalog);
  });

  it('garde la paire entière quand un seul membre correspond', () => {
    // « réduite » n’est que dans le debuff : le buff miroir reste affiché.
    expect(filterEffectCatalog(catalog, 'reduite')).toEqual({
      pairs: [{ buff: atkUp, debuff: atkDown }],
      orphanBuffs: [],
      orphanDebuffs: [],
    });
    expect(filterEffectCatalog(catalog, 'augmentée').pairs).toHaveLength(1);
  });

  it('filtre les deux colonnes d’orphelins chacune de son côté', () => {
    expect(filterEffectCatalog(catalog, 'brule')).toEqual({
      pairs: [],
      orphanBuffs: [],
      orphanDebuffs: [burn],
    });
    expect(filterEffectCatalog(catalog, 'uncounterable').orphanBuffs).toEqual([uncounterable]);
  });

  it('vide tout quand rien ne correspond', () => {
    expect(filterEffectCatalog(catalog, 'zzz')).toEqual({
      pairs: [],
      orphanBuffs: [],
      orphanDebuffs: [],
    });
  });
});
