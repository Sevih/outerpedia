/**
 * Résolveur de presets d'équipement, BIDIRECTIONNEL (admin) :
 *  - `expand*` : déplie un `$slug` en ses pièces → tout devient éditable à la
 *    tuile (mapping 1:1 avec ce qu'on affiche).
 *  - `collapse*` : recompresse des pièces vers `$slug` quand elles ÉGALENT un
 *    preset connu (sinon manuel) → JSON compact, pas de diff géant, et
 *    « détache » proprement dès qu'on modifie vraiment.
 *
 * Pur (presets passés en argument) : utilisable côté lecture (page) comme
 * écriture (store de save).
 */
import type { GearBuild, GearPresets, SetCombo, SetComboPiece } from '@contracts';

/** Clé de multiset stable d'un combo de sets (ordre indifférent). */
function comboKey(pieces: SetComboPiece[]): string {
  return pieces
    .map((p) => `${p.set}:${p.count}`)
    .sort()
    .join('|');
}

// --- Déplier (lecture) ---------------------------------------------------------

function expandTalismans(list: string[] | undefined, presets: GearPresets): string[] | undefined {
  if (!list?.length) return list;
  return list.flatMap((t) => (t.startsWith('$') ? (presets.talismans[t.slice(1)] ?? [t]) : [t]));
}

function expandSets(sets: SetCombo[] | undefined, presets: GearPresets): SetCombo[] | undefined {
  if (!sets?.length) return sets;
  return sets.map((c) =>
    c.preset ? { pieces: presets.sets[c.preset] ?? [] } : { pieces: c.pieces ?? [] },
  );
}

function expandSubstats(substats: string | undefined, presets: GearPresets): string | undefined {
  if (!substats?.startsWith('$')) return substats;
  return presets.substats[substats.slice(1)] ?? substats;
}

/** Déplie tous les presets d'un build (pour l'édition à la tuile). */
export function expandBuild(build: GearBuild, presets: GearPresets): GearBuild {
  return {
    ...build,
    talismans: expandTalismans(build.talismans, presets),
    sets: expandSets(build.sets, presets),
    substats: expandSubstats(build.substats, presets),
  };
}

// --- Recompresser (écriture) ---------------------------------------------------

function collapseTalismans(list: string[] | undefined, presets: GearPresets): string[] | undefined {
  if (!list?.length || list.some((t) => t.startsWith('$'))) return list;
  const key = [...list].sort().join('|');
  for (const [slug, ids] of Object.entries(presets.talismans)) {
    if ([...ids].sort().join('|') === key) return [`$${slug}`];
  }
  return list;
}

function collapseSets(sets: SetCombo[] | undefined, presets: GearPresets): SetCombo[] | undefined {
  if (!sets?.length) return sets;
  const byKey = new Map(Object.entries(presets.sets).map(([slug, p]) => [comboKey(p), slug]));
  return sets.map((c) => {
    if (c.preset || !c.pieces?.length) return c;
    const slug = byKey.get(comboKey(c.pieces));
    return slug ? { preset: slug } : c;
  });
}

function collapseSubstats(substats: string | undefined, presets: GearPresets): string | undefined {
  if (!substats || substats.startsWith('$')) return substats;
  for (const [slug, value] of Object.entries(presets.substats)) {
    if (value === substats) return `$${slug}`;
  }
  return substats;
}

/** Recompresse les pièces d'un build vers `$preset` là où elles matchent. */
export function collapseBuild(build: GearBuild, presets: GearPresets): GearBuild {
  return {
    ...build,
    talismans: collapseTalismans(build.talismans, presets),
    sets: collapseSets(build.sets, presets),
    substats: collapseSubstats(build.substats, presets),
  };
}
