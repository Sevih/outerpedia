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
// L'effet du constat de Sevih, tel que le glossaire le porte.
const speedUp = row(
  '15',
  {
    en: 'Increased Speed',
    jp: 'スピードUP',
    kr: '속도 증가',
    zh: '速度提升',
    fr: 'Vitesse accrue',
    es: 'VEL aumentada',
  },
  ['BT_STAT|ST_SPEED', 'INCREASED_SPEED'],
);

const hit = (r: { haystack: string }, query: string): boolean =>
  effectMatches(r.haystack, query) !== null;

describe('effectMatches — la règle', () => {
  it('« tes » ne trouve plus Increased Speed par le milieu de « Vitesse »', () => {
    expect(effectMatches(speedUp.haystack, 'tes')).toBeNull();
    // Ni par le milieu d'un mot anglais, ni par celui d'une clé.
    expect(effectMatches(speedUp.haystack, 'peed')).toBeNull();
    expect(effectMatches(speedUp.haystack, 'creased')).toBeNull();
    expect(effectMatches(speedUp.haystack, 'tat')).toBeNull();
  });

  it('« tes » ne touche une clé qu’en DÉBUT de mot', () => {
    const mid = row('900', { en: 'Haste' }, ['BT_FASTEST_UP']);
    const start = row('901', { en: 'Haste' }, ['BT_ATTACK_SPEED_UP_TEST']);
    expect(effectMatches(mid.haystack, 'tes')).toBeNull();
    expect(effectMatches(start.haystack, 'tes')).toEqual({
      field: 'key',
      value: 'BT_ATTACK_SPEED_UP_TEST',
    });
  });

  it('« spe » et « speed » le trouvent, par un mot de son nom anglais', () => {
    const byName = { field: 'name.en', value: 'Increased Speed' };
    expect(effectMatches(speedUp.haystack, 'spe')).toEqual(byName);
    expect(effectMatches(speedUp.haystack, 'speed')).toEqual(byName);
    expect(effectMatches(speedUp.haystack, 'inc')).toEqual(byName);
    // Plusieurs mots : chacun commence un mot du nom, peu importe l'ordre.
    expect(effectMatches(speedUp.haystack, 'incr sp')).toEqual(byName);
    expect(effectMatches(speedUp.haystack, 'speed increased')).toEqual(byName);
    expect(effectMatches(speedUp.haystack, 'speed reduced')).toBeNull();
  });

  it('le français répond après l’anglais, lui aussi par début de mot', () => {
    expect(effectMatches(speedUp.haystack, 'vit')).toEqual({
      field: 'name.fr',
      value: 'Vitesse accrue',
    });
    expect(effectMatches(speedUp.haystack, 'accrue')?.field).toBe('name.fr');
    expect(effectMatches(speedUp.haystack, 'itesse')).toBeNull();
  });

  it('l’espagnol n’est pas cherché', () => {
    expect(effectMatches(speedUp.haystack, 'aumentada')).toBeNull();
    expect(effectMatches(speedUp.haystack, 'vel')).toBeNull();
  });

  it('« BT_SP » le trouve par sa clé, et dit laquelle', () => {
    // « bt » puis « sp » : deux mots de `BT_STAT|ST_SPEED`, pas de l'alias.
    expect(effectMatches(speedUp.haystack, 'BT_SP')).toEqual({
      field: 'key',
      value: 'BT_STAT|ST_SPEED',
    });
    expect(effectMatches(speedUp.haystack, 'st_speed')?.value).toBe('BT_STAT|ST_SPEED');
    // Une clé ÉGALE passe avant une clé qui ne fait que commencer pareil.
    const both = row('1069', { en: 'Reduced Damage Taken' }, [
      'BT_STAT|ST_DMG_REDUCE_RATE_IR',
      'BT_STAT|ST_DMG_REDUCE_RATE',
    ]);
    expect(effectMatches(both.haystack, 'bt_stat|st_dmg_reduce_rate')?.value).toBe(
      'BT_STAT|ST_DMG_REDUCE_RATE',
    );
  });

  it('le nom explique avant la clé quand les deux répondent', () => {
    // « speed » est aussi un mot de `INCREASED_SPEED` : c'est le nom qui est rendu.
    expect(effectMatches(speedUp.haystack, 'increased_speed')?.field).toBe('name.en');
  });

  it('« スピ » le trouve par le japonais', () => {
    expect(effectMatches(speedUp.haystack, 'スピ')).toEqual({
      field: 'name.jp',
      value: 'スピードUP',
    });
    // Les idéogrammes sont communs au japonais et au chinois.
    expect(effectMatches(speedUp.haystack, '速度')).toEqual({
      field: 'name.zh',
      value: '速度提升',
    });
    expect(effectMatches(speedUp.haystack, '속도')).toEqual({
      field: 'name.kr',
      value: '속도 증가',
    });
  });

  it('les kana gardent leur voisement : « スピ » n’est pas « スヒ »', () => {
    // Replié comme une saisie latine (ピ → ヒ), « スピ » sortait « Miss Hit ».
    const miss = row('14', { en: 'Increased Miss Chance', jp: 'ミスヒット発生率UP' });
    expect(effectMatches(miss.haystack, 'スピ')).toBeNull();
    expect(effectMatches(miss.haystack, 'スヒ')?.field).toBe('name.jp');
    // La pleine chasse et la casse se replient quand même.
    expect(effectMatches(speedUp.haystack, 'スピードｕｐ')?.field).toBe('name.jp');
  });

  it('une écriture ne répond que si la saisie en porte un caractère', () => {
    // « up » est dans « スピードUP » : une saisie latine ne lit pas le japonais.
    expect(effectMatches(speedUp.haystack, 'up')).toBeNull();
    // Le hangul ne lit ni le japonais ni le chinois.
    expect(effectMatches(atkUp.haystack, '攻撃力')?.field).toBe('name.jp');
    expect(effectMatches(atkUp.haystack, '공격력')?.field).toBe('name.kr');
    expect(effectMatches(burn.haystack, '烧伤')?.field).toBe('name.zh');
    expect(effectMatches(burn.haystack, '공격')).toBeNull();
  });

  it('l’id : égal d’abord, sinon par son début', () => {
    expect(effectMatches(speedUp.haystack, '15')).toEqual({ field: 'id', value: '15' });
    expect(effectMatches(atkDown.haystack, '107')).toEqual({ field: 'id', value: '107' });
    expect(effectMatches(atkDown.haystack, '10')).toEqual({ field: 'id', value: '107' });
    expect(effectMatches(atkDown.haystack, '07')).toBeNull();
    // Un id textuel se lit comme une clé ; ici le nom répond le premier.
    expect(effectMatches(uncounterable.haystack, 'uncounter')?.field).toBe('name.en');
    expect(effectMatches(row('SYS_BUFF_HEAL', {}).haystack, 'heal')).toEqual({
      field: 'id',
      value: 'SYS_BUFF_HEAL',
    });
  });
});

describe('effectMatches — ce qui n’a pas changé', () => {
  it('ignore la casse', () => {
    expect(hit(burn, 'BURN')).toBe(true);
    expect(hit(burn, 'burned')).toBe(true);
  });

  it('ignore les accents, dans la saisie comme dans le nom', () => {
    expect(hit(burn, 'brule')).toBe(true);
    expect(hit(burn, 'BRÛLÉ')).toBe(true);
    expect(hit(atkUp, 'augmentee')).toBe(true);
  });

  it('trouve par clé BT_*, par ses mots', () => {
    expect(hit(atkUp, 'BT_STAT|ST_ATK')).toBe(true);
    expect(hit(atkUp, 'st_atk')).toBe(true);
    expect(hit(burn, 'bt_dot')).toBe(true);
    expect(hit(burn, 'st_atk')).toBe(false);
  });

  it('ne recolle pas deux champs voisins', () => {
    // « 7 » puis « BT_STAT|ST_ATK » : la saisie « 7bt » n’est dans aucun champ.
    expect(hit(atkUp, '7bt')).toBe(false);
    // Deux mots de deux champs différents ne font pas une réponse.
    expect(hit(atkUp, 'increased atk')).toBe(false);
  });

  it('garde tout sur une saisie vide ou blanche, sans nommer de champ', () => {
    expect(effectMatches(burn.haystack, '')).toEqual({ field: 'all', value: '' });
    expect(effectMatches(burn.haystack, '   ')).toEqual({ field: 'all', value: '' });
  });

  it('une saisie sans lettre ni chiffre ne trouve rien', () => {
    expect(effectMatches(atkUp.haystack, '|')).toBeNull();
    expect(effectMatches(atkUp.haystack, '_')).toBeNull();
  });

  it('un nom sur plusieurs lignes reste UN champ', () => {
    const multi = row('5', { en: 'Line one\nLine\ttwo' });
    expect(effectMatches(multi.haystack, 'two')).toEqual({
      field: 'name.en',
      value: 'Line one Line two',
    });
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
    const none = { pairs: [], orphanBuffs: [], orphanDebuffs: [] };
    expect(filterEffectCatalog(catalog, 'zzz')).toEqual(none);
    // La règle nouvelle vaut ici aussi : plus de milieu de mot.
    expect(filterEffectCatalog({ ...catalog, orphanBuffs: [speedUp] }, 'tes')).toEqual(none);
  });
});
