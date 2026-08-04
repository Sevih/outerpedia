/**
 * Cœur pur du générateur ee-effects : réduction d'un effet structuré en clé
 * de comparaison + libellé. Cas d'origine (rapport Sevih 03/08) : Triaena
 * (Lambda) et Frost Nova +10 (Snow core-fusion) portent le même
 * `pierce_power_rate` up sous deux textes différents — la clé doit matcher.
 * Tourne SANS `.gamedata` (entrées synthétiques).
 */
import { describe, expect, it } from 'vitest';
import type { EffectShape } from '../lib/effects';
import { buildEeEffects, entryFor, type EeEffectsInput } from './ee-effects';

const GLOSSARY: Pick<EeEffectsInput, 'statNames' | 'effects' | 'byTooltip' | 'byLabel'> = {
  statNames: {
    pierce_power_rate: { en: 'Penetration', jp: '貫通力', kr: '관통력', zh: '穿透力' },
    speed: { en: 'Speed', jp: '速度', kr: '속도', zh: '速度' },
  },
  effects: new Map([
    [
      'combat_readiness',
      {
        id: 'combat_readiness',
        name: { en: 'Combat Readiness', jp: '', kr: '', zh: '' },
        desc: { en: '', jp: '', kr: '', zh: '' },
        icon: '',
        isDebuff: false,
        origin: 'tooltip' as const,
        tooltips: [],
      },
    ],
  ]),
  byTooltip: new Map([['combat_readiness_var', 'combat_readiness']]),
  byLabel: new Map(),
};

const stat = (over: Partial<EffectShape> = {}): EffectShape => ({
  family: 'stat',
  category: 'buff',
  type: 'BT_STAT',
  target: 'me',
  stat: 'pierce_power_rate',
  mode: 'up',
  ...over,
});

describe('entryFor — réduction en clé comparable', () => {
  it('stat pure → stat:<slug>:<dir>, nom réel du jeu', () => {
    expect(entryFor(stat(), GLOSSARY)).toEqual({
      key: 'stat:pierce_power_rate:up',
      label: 'Penetration up',
      isDebuff: false,
    });
  });

  it('deux textes différents, même stat → MÊME clé (cas Triaena / Frost Nova)', () => {
    const triaena = entryFor(stat({ type: 'BT_STAT' }), GLOSSARY);
    const frostNova = entryFor(stat({ type: 'BT_STAT_PREMIUM' }), GLOSSARY);
    expect(triaena.key).toBe(frostNova.key);
  });

  it('statut nommé → status:<id canonique> via byTooltip, nom du glossaire', () => {
    const e = entryFor(
      {
        family: 'gauge',
        category: 'buff',
        type: 'BT_X',
        target: 'me',
        tooltip: 'combat_readiness_var',
      },
      GLOSSARY,
    );
    expect(e).toEqual({
      key: 'status:combat_readiness',
      label: 'Combat Readiness',
      isDebuff: false,
    });
  });

  it('mécanique adossée à une stat ≠ buff de la même stat', () => {
    const scaling = entryFor(
      { family: 'damage', category: 'buff', type: 'BT_DMG', target: 'me', stat: 'speed' },
      GLOSSARY,
    );
    const buff = entryFor(stat({ stat: 'speed' }), GLOSSARY);
    expect(scaling.key).not.toBe(buff.key);
  });

  it('mécanique pure → type:<type>, libellé lisible ou repli prettifié', () => {
    const known = entryFor(
      { family: 'damage', category: 'buff', type: 'BT_DMG_TO_BOSS', target: 'me' },
      GLOSSARY,
    );
    expect(known).toEqual({ key: 'type:BT_DMG_TO_BOSS', label: 'DMG vs bosses', isDebuff: false });
    const unknown = entryFor(
      { family: 'special', category: 'debuff', type: 'BT_SOMETHING_NEW', target: 'enemy' },
      GLOSSARY,
    );
    expect(unknown).toEqual({
      key: 'type:BT_SOMETHING_NEW',
      label: 'something new',
      isDebuff: true,
    });
  });
});

describe('buildEeEffects — assemblage par porteur', () => {
  const input: EeEffectsInput = {
    ...GLOSSARY,
    ee: {
      '900001': {
        name: { en: 'Test EE', jp: '', kr: '', zh: '' },
        grade: 'unique',
        star: 5,
        icon: '',
        craftable: false,
        options: [],
        passives: [
          { id: 'p1', level: 1, isAdd: false },
          { id: 'p2', level: 10, isAdd: true },
        ],
        character: '2009999',
        trustLevel: 5,
      },
    },
    passives: {
      p1: {
        name: { en: '', jp: '', kr: '', zh: '' },
        desc: { en: '', jp: '', kr: '', zh: '' },
        values: [],
        levels: [],
        icon: '',
        buff: '',
        effects: [stat()],
      },
      p2: {
        name: { en: '', jp: '', kr: '', zh: '' },
        desc: { en: '', jp: '', kr: '', zh: '' },
        values: [],
        levels: [],
        icon: '',
        buff: '',
        effects: [stat(), stat({ stat: 'speed' })],
      },
    },
  };

  it('clé par PORTEUR, effets dédupliqués entre paliers, ordre niv.1 → niv.10', () => {
    expect(buildEeEffects(input)).toEqual({
      '2009999': [
        { key: 'stat:pierce_power_rate:up', label: 'Penetration up', isDebuff: false },
        { key: 'stat:speed:up', label: 'Speed up', isDebuff: false },
      ],
    });
  });

  it('EE sans aucun effet comparable → THROW (preuve requise, pas de silence)', () => {
    const broken: EeEffectsInput = {
      ...input,
      passives: {
        ...input.passives,
        p1: { ...input.passives.p1, effects: [] },
        p2: { ...input.passives.p2, effects: [] },
      },
    };
    expect(() => buildEeEffects(broken)).toThrow(/sans aucun effet comparable/);
  });
});
