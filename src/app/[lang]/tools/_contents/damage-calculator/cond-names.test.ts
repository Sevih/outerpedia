/**
 * Références d'effets de l'UI (cond-names.ts) — rejoué sur les ARTEFACTS
 * réels : la résolution passe par le glossaire des effets, id direct PUIS pont
 * `effectByTooltip` ; les sentinelles de catégorie (9996..9999) et les
 * marqueurs sans nom (4089002) restent hors de la map — le client affiche
 * alors respectivement le gabarit générique et l'id brut (revue 18/08/2026).
 * Depuis le 22/08/2026 la map porte nom + icône + desc (tag inline) et couvre
 * AUSSI les `tooltipId` des DoT (lignes DoT de la table Résultat).
 */
import { describe, expect, it } from 'vitest';
import { getDamageBuffs } from '@/lib/data/damage-buffs';
import { getGlossaries } from '@/lib/data/glossaries';
import type { DamageBuffsData } from '@/lib/damage/inputs';
import { buildEffectRefs, type CondNameGlossary } from './cond-names';

/**
 * Les RÈGLES se jouent sur une fixture : les ids et les noms du jeu (« 1 »
 * Burned, pont « 66 » → Cooldown Increase, « 40 » Dual Attack, marqueur
 * 4089002… relevés le 18/08/2026) servent de modèle, mais un renommage ou un
 * pont déplacé par un patch ne doit pas faire casser le test. La donnée réelle
 * n'est rejouée que pour des invariants (dernier bloc).
 */
const row = (over: Partial<DamageBuffsData['buffs'][string][number]>) => ({
  level: 1,
  type: 'BT_STAT',
  ...over,
});
const FIXTURE_BUFFS: DamageBuffsData = {
  buffs: {
    direct: [row({ conditionType: 'TARGET_HAS_BUFF', conditionValue: 1 })],
    bridged: [row({ conditionType: 'OWNER_HAS_BUFF', conditionValue: 66 })],
    dot: [row({ type: 'BT_DOT_BLEED', tooltipId: 3 })],
    negative: [row({ conditionType: 'CASTER_HAS_NOT_BUFF', conditionValue: 40 })],
    sentinel: [row({ conditionType: 'TARGET_HAS_BUFF', conditionValue: 9997 })],
    nameless: [row({ conditionType: 'TARGET_HAS_NOT_BUFF', conditionValue: 4089002 })],
    other: [row({ conditionType: 'TARGET_ELEMENT', conditionValue: 7 })],
  },
};
const FIXTURE_GLOSS: CondNameGlossary = {
  effects: {
    '1': { name: { en: 'Burned', fr: 'Brûlure' }, icon: 'IG_Buff_Dot_Burn', isDebuff: true },
    '64': { name: { en: 'Cooldown Increase' }, icon: 'IG_Buff_CT_Up' },
    '3': {
      name: { en: 'Bleeding' },
      desc: { en: 'Takes damage based on Attack.' },
      icon: 'IG_Buff_Dot_Bleed',
      isDebuff: true,
    },
    '40': { name: { en: 'Dual Attack' } },
    '9997': { name: { en: 'Category' } },
    '4089002': { name: { en: '' } },
    '7': { name: { en: 'Element' } },
  },
  effectByTooltip: { '66': '64' },
};

describe('buildEffectRefs — règles (fixture)', () => {
  const refs = buildEffectRefs(FIXTURE_BUFFS, FIXTURE_GLOSS, 'en');

  it('résout en direct ET via le pont effectByTooltip', () => {
    expect(refs['1']?.name).toBe('Burned');
    // Pont effectByTooltip : « 66 » n'est pas une clé d'effet mais une réf de
    // tooltip — perdue avant la revue du 18/08/2026.
    expect(refs['66']?.name).toBe('Cooldown Increase');
  });

  it('localise le nom, avec repli sur l’anglais', () => {
    const fr = buildEffectRefs(FIXTURE_BUFFS, FIXTURE_GLOSS, 'fr');
    expect(fr['1']?.name).toBe('Brûlure');
    expect(fr['66']?.name).toBe('Cooldown Increase');
  });

  it('porte icône, desc et sens (tag inline) — y compris pour un tooltipId de DoT', () => {
    expect(refs['3']).toEqual({
      name: 'Bleeding',
      icon: 'IG_Buff_Dot_Bleed',
      desc: 'Takes damage based on Attack.',
      debuff: true,
    });
    expect(refs['66']?.debuff).toBe(false);
  });

  it('la famille HAS_NOT_BUFF est collectée aussi', () => {
    // L'ancienne regex /HAS_(ALL_)?BUFF/ laissait la famille négative anonyme.
    expect(refs['40']?.name).toBe('Dual Attack');
  });

  it('sentinelles, marqueurs sans nom et conditions hors buff restent hors de la map', () => {
    expect(refs['9997']).toBeUndefined();
    // Marqueur au NameID vide (4089002 des Irréguliers) — jamais un nom inventé.
    expect(refs['4089002']).toBeUndefined();
    expect(refs['7']).toBeUndefined();
  });
});

describe('buildEffectRefs — invariants sur la donnée réelle', () => {
  const refs = buildEffectRefs(getDamageBuffs(), getGlossaries(), 'en');

  it('la map n’est pas vide et chaque entrée a un nom', () => {
    expect(Object.keys(refs).length).toBeGreaterThan(0);
    for (const [id, ref] of Object.entries(refs)) expect(ref.name, id).toBeTruthy();
  });

  it('aucune sentinelle de catégorie n’y entre', () => {
    for (const s of ['9996', '9997', '9998', '9999']) expect(refs[s]).toBeUndefined();
  });
});
