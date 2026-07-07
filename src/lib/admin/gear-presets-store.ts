/**
 * Écriture des PRESETS de gear reco — réservée à l'ADMIN local.
 * Le fichier est remplacé entier (petit et cohérent), validation avant écriture
 * + garde-fou : refuse de supprimer un preset encore référencé par un build.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { GearBuild, GearPresets } from '@contracts';
import { validateGearPresets } from '@datagen/curated/gear-reco';

const PATH = resolve(process.cwd(), 'data/curated/gear-presets.json');
const RECO_PATH = resolve(process.cwd(), 'data/curated/gear-reco.json');

const sortKeys = <T>(o: Record<string, T>) =>
  Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));

/** Presets référencés par les builds mais absents de `p` (à ne pas casser). */
function brokenRefs(p: GearPresets): string[] {
  let reco: Record<string, GearBuild[]> = {};
  try {
    reco = JSON.parse(readFileSync(RECO_PATH, 'utf8')) as Record<string, GearBuild[]>;
  } catch {
    return [];
  }
  const broken = new Set<string>();
  for (const [charId, builds] of Object.entries(reco))
    for (const b of builds) {
      for (const tl of b.talismans ?? [])
        if (tl.startsWith('$') && !p.talismans[tl.slice(1)])
          broken.add(`${tl} (talismans, ${charId}/${b.name})`);
      for (const c of b.sets ?? [])
        if (c.preset && !p.sets[c.preset]) broken.add(`$${c.preset} (sets, ${charId}/${b.name})`);
      if (b.substats?.startsWith('$') && !p.substats[b.substats.slice(1)])
        broken.add(`${b.substats} (substats, ${charId}/${b.name})`);
    }
  return [...broken];
}

/** Valide puis remplace le fichier de presets. Renvoie les erreurs (vide = OK). */
export function saveGearPresets(p: GearPresets): string[] {
  const errors = validateGearPresets(p);
  if (errors.length) return errors;
  const broken = brokenRefs(p);
  if (broken.length) return broken.map((b) => `preset encore référencé : ${b}`);
  writeFileSync(
    PATH,
    JSON.stringify(
      {
        talismans: sortKeys(p.talismans),
        sets: sortKeys(p.sets),
        substats: sortKeys(p.substats),
      },
      null,
      2,
    ) + '\n',
  );
  return [];
}
