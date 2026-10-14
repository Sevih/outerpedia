/**
 * Garde des presets de gear reco, sur la donnée COMMITTÉE.
 *
 * `data/curated/gear-presets.json` s'édite à la main (aucun écran ne l'édite
 * depuis le retrait de l'admin, le 13/10) : rien d'autre ne relit sa forme, ni
 * les `$slug` que `gear-reco.json` y cite. Et un DOUBLON y est un piège
 * silencieux : `collapseBuild` (`src/lib/admin/gear-preset-resolve.ts`)
 * recompresse vers le PREMIER preset égal qu'il trouve — deux presets égaux,
 * et un build retombe sur l'un ou l'autre au gré de l'ordre du fichier. Deux
 * l'ont été (`$mrs` = `$elemcritAP`, `a2p2` = `p2a2`), fusionnés à la main le
 * 14/10.
 */
import { describe, expect, it } from 'vitest';
import presetsData from '../../data/curated/gear-presets.json';
import recoData from '../../data/curated/gear-reco.json';
import { validateGearPresets, type GearBuild, type GearPresets } from './gear-reco';

const presets = presetsData as unknown as GearPresets;
const reco = recoData as unknown as Record<string, GearBuild[]>;

/** Les builds, nommés pour le message d'échec (`<id perso> › <build>`). */
const builds = Object.entries(reco)
  .filter(([id]) => !id.startsWith('_'))
  .flatMap(([id, list]) => list.map((b) => ({ at: `${id} › ${b.name}`, build: b })));

/** Les slugs qui partagent une même clé, groupés (`[]` = aucun doublon). */
function duplicates<T>(record: Record<string, T>, key: (v: T) => string): string[][] {
  const bySlug = new Map<string, string[]>();
  for (const [slug, v] of Object.entries(record)) {
    const k = key(v);
    bySlug.set(k, [...(bySlug.get(k) ?? []), slug]);
  }
  return [...bySlug.values()].filter((slugs) => slugs.length > 1);
}

describe('gear-presets.json — forme, références, doublons', () => {
  it('la forme : validateGearPresets sans écart', () => {
    expect(validateGearPresets(presets)).toEqual([]);
  });

  it('chaque `$slug` cité par un build existe dans les presets', () => {
    const missing: string[] = [];
    for (const { at, build } of builds) {
      for (const t of build.talismans ?? []) {
        if (t.startsWith('$') && !(t.slice(1) in presets.talismans))
          missing.push(`${at} : talismans ${t}`);
      }
      for (const c of build.sets ?? []) {
        if (c.preset !== undefined && !(c.preset in presets.sets))
          missing.push(`${at} : sets ${c.preset}`);
      }
      const s = build.substats;
      if (s?.startsWith('$') && !(s.slice(1) in presets.substats))
        missing.push(`${at} : substats ${s}`);
    }
    expect(missing).toEqual([]);
  });

  it('aucun preset de talismans n’a le même ensemble d’ids qu’un autre (ordre indifférent)', () => {
    expect(duplicates(presets.talismans, (ids) => [...ids].sort().join('|'))).toEqual([]);
  });

  it('aucun preset de sets n’a le même combo qu’un autre (ordre indifférent)', () => {
    // La clé de `comboKey` (gear-preset-resolve.ts) : `set:count`, triés.
    const comboKey = (pieces: GearPresets['sets'][string]) =>
      pieces
        .map((p) => `${p.set}:${p.count}`)
        .sort()
        .join('|');
    expect(duplicates(presets.sets, comboKey)).toEqual([]);
  });

  it('aucun preset de substats n’a la même chaîne qu’un autre', () => {
    expect(duplicates(presets.substats, (s) => s)).toEqual([]);
  });
});
