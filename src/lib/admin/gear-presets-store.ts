/**
 * Écriture des PRESETS de gear reco — réservée à l'ADMIN local.
 * Le fichier est remplacé entier (petit et cohérent), validation avant écriture
 * + garde-fou : refuse de supprimer un preset encore référencé par un build.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { GearBuild, GearPresets } from '@contracts';
import { validateGearPresets } from '@datagen/curated/gear-reco';
import { writeJson } from '@datagen/lib/json';

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

/**
 * Valide puis remplace le fichier de presets. Renvoie les erreurs (vide = OK).
 *
 * Passe par `writeJson` comme les 15 autres stores (audit F10) : ce fichier était
 * le SEUL écrit avec `writeFileSync` + `JSON.stringify` nu. Deux conséquences,
 * toutes deux vécues :
 *   - pas d'atomicité — une interruption laissait un JSON tronqué, que
 *     `readCuratedJson` refuse ensuite (il LÈVE), donc `pnpm dev` et le build
 *     bloqués jusqu'à réparation manuelle (le trou que F1 avait manqué) ;
 *   - format hors canon — les tableaux courts partaient éclatés, le hook
 *     pre-commit prettier les ramassait derrière, et chaque édition d'UN preset
 *     produisait un diff git sur tout le fichier.
 */
export async function saveGearPresets(p: GearPresets): Promise<string[]> {
  const errors = validateGearPresets(p);
  if (errors.length) return errors;
  const broken = brokenRefs(p);
  if (broken.length) return broken.map((b) => `preset still referenced : ${b}`);
  await writeJson(PATH, {
    talismans: sortKeys(p.talismans),
    sets: sortKeys(p.sets),
    substats: sortKeys(p.substats),
  });
  return [];
}
