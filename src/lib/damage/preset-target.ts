/**
 * Résolution d'une cible PRESET du calculateur (`ti`/`si` de l'état `?z=`) —
 * élément du monstre + stats de FICHE au spawn, par le MÊME calcul que le
 * wrapper serveur (`statAt` : niveau + adv + bossHp), et à part son passif de
 * fiche (`presetSpawnPremium`), que le moteur verse au canal de stat de la
 * cible avec ses autres buffs (quirks « boss » du compte, chips, enrage).
 * Node-safe : le rejeu des fixtures (harnais § 4) résout ici ce que l'UI
 * affichait, le wrapper construit ses spawns avec `presetSpawnStats` et
 * `presetSpawnPremium` — une seule source.
 *
 * PAS exporté du barrel `src/lib/damage/index.ts` : ce module lit au DISQUE
 * (loadDataJson — `getMonster` ET `encounters.json`, une seule voie de
 * chargement, audit D5 07/08/2026) — serveur/node UNIQUEMENT, l'inclure dans
 * le barrel le tirerait dans les bundles client qui l'importent.
 */

import type { EncountersFile, Monster } from '@contracts';
import { loadDataJson } from '@/lib/data/disk';
import { encounterSpawnContexts, type Encounter } from '@/lib/data/encounters';
import { getMonster } from '@/lib/data/monsters';
import { combatStatAt, quirkBossType, statAt, type SpawnContext } from '@/lib/monster-stats';
import type { TargetStatKey } from './inputs';
import type { ResolvedPresetTarget } from './scenario';

const dungeons = (): EncountersFile => loadDataJson<EncountersFile>('generated/encounters.json');

/** Clés du calculateur → slugs des tables monstre (les MÊMES stats). */
const PRESET_STAT_SLUGS: readonly (readonly [TargetStatKey, string])[] = [
  ['hp', 'hp'],
  ['def', 'def'],
  ['dmgRed', 'dmg_reduce'],
  ['cdmgRed', 'enemy_critical_dmg_reduce'],
  // RES : le jet de pose des débuffs (§ 5).
  ['res', 'buff_resist'],
];

/**
 * Stats de FICHE d'un monstre à un spawn — celles qui pèsent sur les dégâts
 * reçus (décision Sevih 27/07/2026) et la RES de la pose des débuffs. Les
 * zéros sont OMIS (élagage du payload, un champ absent vaut 0).
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
 * Passif de FICHE d'un monstre (`Monster.statPremium`) sur les stats du
 * calculateur, au spawn : les PV REMPLACÉS (`bossHp`, overgrade) n'en
 * prennent pas — le jeu les pose hors du taux de buff (`combatStatAt`).
 * `undefined` sans passif sur ces stats.
 */
export function presetSpawnPremium(
  monster: Monster,
  ctx: SpawnContext,
): ResolvedPresetTarget['premium'] {
  const out: NonNullable<ResolvedPresetTarget['premium']> = {};
  for (const [key, slug] of PRESET_STAT_SLUGS) {
    const p = monster.statPremium?.[slug];
    if (!p || (key === 'hp' && (ctx.bossHp || ctx.overGrade))) continue;
    out[key] = { ...p };
  }
  return Object.keys(out).length ? out : undefined;
}

/**
 * Stats de COMBAT d'un monstre à un spawn, celles de la page du boss
 * (`combatStatAt` : passif de fiche et `quirkMods` au taux de buff) — les
 * seules clés qui DIFFÈRENT de la fiche (`presetSpawnStats`), `undefined`
 * sinon. Affichage seulement : le moteur compose fiche, passif et quirks
 * réglés dans le calculateur.
 */
export function presetSpawnCombat(
  monster: Monster,
  ctx: SpawnContext,
  quirkMods: Record<string, number>,
): ResolvedPresetTarget['stats'] | undefined {
  const out: ResolvedPresetTarget['stats'] = {};
  for (const [key, slug] of PRESET_STAT_SLUGS) {
    const r = monster.stats[slug];
    if (!r) continue;
    const v = combatStatAt(slug, r, ctx, monster.statPremium, quirkMods);
    if (v.combat !== v.sheet) out[key] = v.combat;
  }
  return Object.keys(out).length ? out : undefined;
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
  const ref = dungeons()[encounterId];
  if (!ref?.monsters?.length) return undefined;
  const entry = ref.monsters.find((m) => m.id === monsterId);
  const monster = getMonster(monsterId);
  if (!entry || !monster) return undefined;
  const e: Encounter = { id: encounterId, ref, monsters: ref.monsters };
  // La langue ne teinte que les LIBELLÉS des contextes — jamais les stats.
  // `overgrade` : les stages au-delà du dernier templeté du main boss de
  // guild raid sont des contextes de spawn du MÊME donjon (si = index).
  const contexts = encounterSpawnContexts(e, entry, 'en', { overgrade: true });
  const ctx = contexts[Math.min(Math.max(spawnIdx, 0), contexts.length - 1)];
  if (!ctx) return undefined;
  const premium = presetSpawnPremium(monster, ctx);
  return {
    element: monster.element,
    stats: presetSpawnStats(monster, ctx),
    ...(premium ? { premium } : {}),
    ...(quirkBossType(monster.type) ? { quirkBoss: true as const } : {}),
    mode: ref.mode,
    // La cible du preset EST le monstre : ses passifs s'activent (passives.ts).
    monsterId,
  };
}
