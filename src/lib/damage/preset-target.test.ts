/**
 * Resolver preset NODE (harnais § 4) — vérifie le câblage réel : encounters
 * committés, fiches monstre lues au disque, `statAt` partagé. Propriétés,
 * jamais de nombres recopiés d'un rendu.
 */
import { describe, expect, it } from 'vitest';
import type { EncountersFile } from '@contracts';
import encountersData from '../../../data/generated/encounters.json';
import { getMonster } from '@/lib/data/monsters';
import { resolvePresetTarget } from './preset-target';

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
