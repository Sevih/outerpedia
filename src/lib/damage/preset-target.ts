/**
 * Résolution d'une cible PRESET du calculateur (`ti`/`si` de l'état `?z=`) —
 * élément du monstre + stats défensives EFFECTIVES au spawn, par le MÊME calcul
 * que le wrapper serveur (`statAt` : niveau + adv + bossHp). Node-safe : le
 * rejeu des fixtures (harnais § 4) résout ici ce que l'UI affichait, le
 * wrapper construit ses spawns avec `presetSpawnStats` — une seule source.
 *
 * PAS exporté du barrel `src/lib/damage/index.ts` : `getMonster` lit au
 * DISQUE (loadDataJson) — ce module est serveur/node UNIQUEMENT, l'inclure
 * dans le barrel le tirerait dans les bundles client qui l'importent.
 */

import encountersData from '@data/generated/encounters.json';
import type { EncountersFile, Monster } from '@contracts';
import { encounterSpawnContexts, type Encounter } from '@/lib/data/encounters';
import { getMonster } from '@/lib/data/monsters';
import { statAt, type SpawnContext } from '@/lib/monster-stats';
import type { ResolvedPresetTarget } from './scenario';

const DUNGEONS = encountersData as unknown as EncountersFile;

/** Clés du calculateur → slugs des tables monstre (les MÊMES stats). */
const PRESET_STAT_SLUGS = [
  ['hp', 'hp'],
  ['def', 'def'],
  ['dmgRed', 'dmg_reduce'],
  ['cdmgRed', 'enemy_critical_dmg_reduce'],
] as const;

/**
 * Stats défensives effectives d'un monstre à un spawn — celles qui pèsent sur
 * les dégâts reçus (décision Sevih 27/07/2026). Les zéros sont OMIS (élagage
 * du payload, un champ absent vaut 0).
 */
export function presetSpawnStats(
  monster: Monster,
  ctx: SpawnContext,
): ResolvedPresetTarget['stats'] {
  const stats: ResolvedPresetTarget['stats'] = {};
  for (const [key, slug] of PRESET_STAT_SLUGS) {
    const r = monster.stats[slug];
    const v = r ? statAt(slug, r, ctx) : 0;
    if (v) stats[key] = v;
  }
  return stats;
}

/**
 * `ti` (= `${encounterId}:${monsterId}`) + index de spawn → cible résolue.
 * `undefined` si l'id ne se résout pas — jamais de stats plausibles.
 *
 * TOUT monstre de la rencontre est ciblable (boss ET renforts — les vagues du
 * picker story, 06/08/2026 ; boss seuls avant). Un monstre répété dans le
 * donjon à PLUSIEURS niveaux y a plusieurs entrées de même id : la PREMIÈRE
 * fait foi (même dédup que l'UI, qui n'émet qu'une entrée par id).
 */
export function resolvePresetTarget(
  targetId: string,
  spawnIdx: number,
): ResolvedPresetTarget | undefined {
  const sep = targetId.lastIndexOf(':');
  if (sep <= 0) return undefined;
  const encounterId = targetId.slice(0, sep);
  const monsterId = targetId.slice(sep + 1);
  const ref = DUNGEONS[encounterId];
  if (!ref?.monsters?.length) return undefined;
  const entry = ref.monsters.find((m) => m.id === monsterId);
  const monster = getMonster(monsterId);
  if (!entry || !monster) return undefined;
  const e: Encounter = { id: encounterId, ref, monsters: ref.monsters };
  // La langue ne teinte que les LIBELLÉS des contextes — jamais les stats.
  const contexts = encounterSpawnContexts(e, entry, 'en');
  const ctx = contexts[Math.min(Math.max(spawnIdx, 0), contexts.length - 1)];
  if (!ctx) return undefined;
  return {
    element: monster.element,
    stats: presetSpawnStats(monster, ctx),
    mode: ref.mode,
    // La cible du preset EST le monstre : ses passifs s'activent (passives.ts).
    monsterId,
  };
}
