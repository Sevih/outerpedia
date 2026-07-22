import { describe, expect, it } from 'vitest';
import { statAbbr, statIconSprite, statOptionView } from '@/lib/stats';
import { statName } from '@/lib/data/stat-glossary';

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

  it('EFF/RES flat sont BRUTS (RAW_FLAT_STATS) : pas de %', () => {
    expect(statOptionView('buff_chance', 'flat')).toEqual({ key: 'EFF', percent: false });
  });

  it('stat % pure (vampiric/LS) : percent true, clé sans suffixe', () => {
    expect(statOptionView('vampiric', 'none')).toEqual({ key: 'LS', percent: true });
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
