import { describe, expect, it } from 'vitest';
import {
  currentStatSlug,
  LEGACY_STAT_SLUGS,
  STAT_ABBR,
  statAbbr,
  statIconSprite,
  statOptionView,
} from '@/lib/stats';
import { statDesc, statName } from '@/lib/data/stat-glossary';
import { STAT_TYPE_SLUGS } from '@/../datagen/lib/stats';
import { fillPlaceholders, optionStatLabel } from '@/lib/data/equipment';
import { fillValuePlaceholders } from '@/../datagen/lib/placeholders';
import { getEquipmentPools } from '@/lib/data/equipment-pools';

describe('statAbbr', () => {
  it('rend l’abréviation canonique d’un slug connu', () => {
    expect(statAbbr('critical_rate')).toBe('CHC');
    expect(statAbbr('speed')).toBe('SPD');
  });

  it('replie sur le slug en capitales pour un slug inconnu', () => {
    expect(statAbbr('mystery_stat')).toBe('MYSTERY_STAT');
  });
});

describe('statOptionView', () => {
  it('stat flat (ATK) : pas de %, clé nue', () => {
    expect(statOptionView('atk', 'flat')).toEqual({ key: 'ATK', percent: false });
  });

  it('stat flat en variante RATE : % + suffixe (ATK%)', () => {
    expect(statOptionView('atk', 'rate')).toEqual({ key: 'ATK%', percent: true });
  });

  it('stat intrinsèquement % (CHC) : percent true, clé sans suffixe (pas dans PCT_SUFFIX)', () => {
    expect(statOptionView('critical_rate', 'none')).toEqual({ key: 'CHC', percent: true });
  });

  it('EFF/RES flat sont BRUTS : le client ne les classe pas en % (IsPercentStat)', () => {
    expect(statOptionView('buff_chance', 'flat')).toEqual({ key: 'EFF', percent: false });
  });

  it('stat % pure (vampiric/LS) : percent true, clé sans suffixe', () => {
    expect(statOptionView('vampiric', 'none')).toEqual({ key: 'LS', percent: true });
  });

  it('EFF/RES en RATE : % + suffixe (EFF%, RES%), distincts de la variante plate', () => {
    expect(statOptionView('buff_chance', 'rate')).toEqual({ key: 'EFF%', percent: true });
    expect(statOptionView('buff_resist', 'rate')).toEqual({ key: 'RES%', percent: true });
    expect(statOptionView('buff_resist', 'flat')).toEqual({ key: 'RES', percent: false });
  });
});

describe('optionStatLabel — même règle que statOptionView', () => {
  const options = Object.values(getEquipmentPools()).flat();

  it('cartes /equipment et page détail donnent la même clé sur tout pools.json', () => {
    const diffs = options
      .filter((o) => o.stat && o.stat !== 'none')
      .filter((o) => optionStatLabel(o) !== statOptionView(o.stat, o.mode).key)
      .map((o) => `${o.stat}/${o.mode}`);
    expect(options.length).toBeGreaterThan(0);
    expect([...new Set(diffs)]).toEqual([]);
  });

  it('les cartes gardent EFF% / RES% sur la variante en %', () => {
    const labels = new Set(options.map(optionStatLabel));
    for (const k of ['EFF', 'EFF%', 'RES', 'RES%']) expect(labels.has(k), k).toBe(true);
  });
});

describe('un seul espace de slugs (C27)', () => {
  it('STAT_ABBR ne connaît que des slugs de la table, sans doublon mécanique', () => {
    const slugs = new Set(Object.values(STAT_TYPE_SLUGS));
    for (const k of Object.keys(STAT_ABBR)) expect(slugs.has(k), k).toBe(true);
    for (const old of Object.keys(LEGACY_STAT_SLUGS)) expect(STAT_ABBR[old], old).toBeUndefined();
  });

  it('l’ancien slug mécanique → slug de la table (et rien d’autre ne bouge)', () => {
    expect(LEGACY_STAT_SLUGS).toEqual({
      wg: 'guard',
      critical_dmg_rate: 'critical_dmg',
      dmg_reduce_rate: 'dmg_reduce',
      dmg_boost: 'damage_boost',
      accuracy: 'effectiveness',
      avoid: 'resilience',
      e_cri_dmg_reduce: 'enemy_critical_dmg_reduce',
      hit_ap: 'hit_bp',
      enter_ap: 'enter_bp',
      kill_ap: 'kill_bp',
      get_character_exp_rate: 'get_char_exp_rate',
    });
    expect(currentStatSlug('dmg_reduce_rate')).toBe('dmg_reduce');
    expect(currentStatSlug('atk')).toBe('atk');
    expect(currentStatSlug('damage_boost')).toBe('damage_boost');
  });

  it('pools au slug de la table : DMG RED% en %, abréviations inchangées', () => {
    expect(statOptionView('dmg_reduce', 'flat')).toEqual({ key: 'DMG RED%', percent: true });
    expect(statOptionView('critical_dmg', 'flat')).toEqual({ key: 'CHD', percent: true });
    expect(statOptionView('damage_boost', 'flat')).toEqual({ key: 'DMG UP%', percent: true });
    expect(statOptionView('enemy_critical_dmg_reduce', 'flat')).toEqual({
      key: 'CDMG RED%',
      percent: true,
    });
    // Sans abréviation : la secondaire d'EE reste brute, nommée par le glossaire.
    expect(statOptionView('hit_bp', 'flat')).toEqual({ key: 'HIT_BP', percent: false });
  });

  it('glossaire des noms à clé de la table : nom direct = nom par abréviation', () => {
    for (const [slug, abbr] of [
      ['critical_dmg', 'CHD'],
      ['damage_boost', 'DMG UP%'],
      ['dmg_reduce', 'DMG RED%'],
      ['enemy_critical_dmg_reduce', 'CDMG RED%'],
    ]) {
      expect(statName(slug, 'en'), slug).toBe(statName(abbr, 'en'));
      expect(statName(slug, 'en'), slug).not.toBe(slug);
      expect(statDesc(slug, 'en'), slug).toBe(statDesc(abbr, 'en'));
    }
    // Les compteurs AP (texte `SYS_STAT_HIT_AP`…) gardent le nom du jeu.
    expect(statName('hit_bp', 'en')).not.toBe('hit_bp');
    expect(statName('enter_bp', 'en')).not.toBe('enter_bp');
  });
});

describe('statIconSprite', () => {
  it('rend le sprite d’icône d’une stat qui en a une', () => {
    expect(statIconSprite('atk')).toBe('CM_Stat_Icon_ATK');
  });

  it('rend `undefined` pour la WG (guard) — le jeu ne lui donne pas d’icône de stat', () => {
    expect(statIconSprite('guard')).toBeUndefined();
  });
});

describe('statName', () => {
  it('rend un nom localisé non vide pour une stat du glossaire', () => {
    expect(statName('atk', 'en').length).toBeGreaterThan(0);
  });

  it('replie sur l’entrée telle quelle pour un slug inconnu', () => {
    expect(statName('__inconnu__', 'en')).toBe('__inconnu__');
  });
});

describe('fillPlaceholders (site) — la règle du module partagé, couleur par défaut', () => {
  it('identique à fillValuePlaceholders avec couleur, et sans couleur sur demande', () => {
    const v = { value: '2%', rate: '50%', turn: '1', value2: '3', turn2: '2' };
    const tpl = '[Value] [+Value] [-Value] [Rate] [Turn] [+Turn] [Value2] [Turn2] [Value4]';
    expect(fillPlaceholders(tpl, v)).toBe(fillValuePlaceholders(tpl, v, true));
    expect(fillPlaceholders(tpl, v, false)).toBe(fillValuePlaceholders(tpl, v, false));
  });
});
