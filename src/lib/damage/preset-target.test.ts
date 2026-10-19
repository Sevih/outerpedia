/**
 * Resolver preset NODE (harnais § 4) — vérifie le câblage réel : encounters
 * committés, fiches monstre lues au disque, `statAt` partagé. Propriétés,
 * jamais de nombres recopiés d'un rendu.
 */
import { describe, expect, it } from 'vitest';
import type { EncountersFile } from '@contracts';
import encountersData from '../../../data/generated/encounters.json';
import { getMonster } from '@/lib/data/monsters';
import { infiltrationOrder, resolvePresetTarget } from './preset-target';

const DUNGEONS = encountersData as unknown as EncountersFile;

/** Premier target constructible — la MÊME règle d'éligibilité que le wrapper
 *  (boss présent, fiche monstre connue, donjon non retiré). */
const ti = (() => {
  for (const [id, ref] of Object.entries(DUNGEONS)) {
    if (ref.retired) continue;
    const boss = ref.monsters?.find((m) => m.role === 'boss' && getMonster(m.id));
    if (boss) return `${id}:${boss.id}`;
  }
  return undefined;
})();

/** Premier RENFORT constructible (role add) — ciblable depuis le 06/08/2026
 *  (les vagues complètes du picker story, demande Sevih). */
const tiAdd = (() => {
  for (const [id, ref] of Object.entries(DUNGEONS)) {
    if (ref.retired) continue;
    const add = ref.monsters?.find((m) => m.role === 'add' && getMonster(m.id));
    if (add) return `${id}:${add.id}`;
  }
  return undefined;
})();

describe('resolvePresetTarget (node)', () => {
  it('résout un preset réel : élément + au moins une stat défensive > 0', () => {
    expect(ti).toBeDefined();
    const r = resolvePresetTarget(ti as string, 0);
    expect(r).toBeDefined();
    expect(r?.element).toBeTruthy();
    expect(Object.values(r?.stats ?? {}).some((v) => (v ?? 0) > 0)).toBe(true);
  });

  it('résout aussi un RENFORT (role add) — les vagues du picker story', () => {
    expect(tiAdd).toBeDefined();
    const r = resolvePresetTarget(tiAdd as string, 0);
    expect(r).toBeDefined();
    expect(r?.element).toBeTruthy();
    expect(Object.values(r?.stats ?? {}).some((v) => (v ?? 0) > 0)).toBe(true);
  });

  it('index de spawn hors bornes → clampé au dernier (comme l’UI)', () => {
    expect(resolvePresetTarget(ti as string, 9999)).toBeDefined();
  });

  it('id inconnu ou malformé → undefined, jamais de stats plausibles', () => {
    expect(resolvePresetTarget('inconnu:000', 0)).toBeUndefined();
    expect(resolvePresetTarget('sans-separateur', 0)).toBeUndefined();
  });
});

describe('infiltrationOrder — étage, zone, combat', () => {
  type Ref = EncountersFile[string];
  const ref = (infiltration: Ref['infiltration']): Ref => ({
    mode: 'irregular_infiltrate',
    name: { en: '' } as Ref['name'],
    infiltration,
  });
  const ev = { en: 'x' } as NonNullable<Ref['infiltration']>['event'];
  /** Les refs triées par la clé (tri stable, terme à terme, comme l'UI). */
  const sorted = (refs: Ref[]): Ref[] =>
    [...refs].sort((a, b) => {
      const oa = infiltrationOrder(a);
      const ob = infiltrationOrder(b);
      const i = oa.findIndex((v, j) => v !== ob[j]);
      return i < 0 ? 0 : oa[i] - ob[i];
    });

  it('les combats d’une zone par nœud, les zones par rang', () => {
    const a = ref({ floor: 1, zone: 1, node: 1105 });
    const b = ref({ floor: 1, zone: 1, node: 1101 });
    const c = ref({ floor: 1, zone: 2, node: 1202 });
    const d = ref({ floor: 1, zone: 1, node: 1103 });
    expect(sorted([c, a, b, d])).toEqual([b, d, a, c]);
  });

  it('les événements d’un étage après ses zones, entre eux dans l’ordre reçu', () => {
    const e1 = ref({ floor: 1, event: ev });
    const e2 = ref({ floor: 1, event: ev });
    const z = ref({ floor: 1, zone: 3, node: 1302 });
    expect(sorted([e1, z, e2])).toEqual([z, e1, e2]);
  });

  it('les étages croissants, un événement d’étage 1 avant une zone d’étage 2', () => {
    const f3 = ref({ floor: 3, zone: 1, node: 3101 });
    const f2 = ref({ floor: 2, zone: 1, node: 2102 });
    const e1 = ref({ floor: 1, event: ev });
    expect(sorted([f3, f2, e1])).toEqual([e1, f2, f3]);
  });
});
