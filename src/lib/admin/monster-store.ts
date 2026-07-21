/**
 * Accès app au domaine MONSTRE de l'extracteur (réservé à l'admin local).
 *
 * Mince façade, comme `review-store` : isole l'import datagen côté serveur.
 * `fresh*` = extraction fraîche en mémoire ; `committed*` = data/generated
 * du disque (`{}` si pas encore intégré — le domaine est jeune).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildMonsters, type Monster } from '@datagen/extractor/specs/monster';
import {
  buildEncounters,
  type DungeonRef,
  type EncountersData,
} from '@datagen/generators/encounters';
import { buildContentSchedule } from '@datagen/generators/content-schedule';
import { buildSingularity } from '@datagen/generators/singularity';
import { buildTowers } from '@datagen/generators/towers';
import { buildItemSources } from '@datagen/generators/sources';
import { curatedBossIds, loadEquipmentCurated } from '@datagen/curated/equipment';
import { fileStamp, loadTable, tablesStamp } from '@datagen/lib/tables';
import { loadTextIndex, resolveText } from '@datagen/lib/text';
import type { Skill } from '@datagen/generators/skills';
import { statAbbr } from '@/lib/stats';
import { listGuides } from '@/lib/data/guides';

export type { DungeonRef, EncountersData, Monster, Skill };

export function freshMonsters(): Record<string, Monster> {
  return buildMonsters().monsters;
}

export function freshEncounters(): EncountersData {
  return buildEncounters();
}

function readGenerated<T>(rel: string): T | undefined {
  try {
    return JSON.parse(readFileSync(resolve('data/generated', rel), 'utf8')) as T;
  } catch {
    return undefined;
  }
}

export function committedMonsters(): Record<string, Monster> {
  return readGenerated<Record<string, Monster>>('monsters.json') ?? {};
}

export function committedMonsterSkills(): Record<string, Skill> {
  return readGenerated<Record<string, Skill>>('monster-skills.json') ?? {};
}

/**
 * Donjons VALIDÉS (`encounters.json`) — repli d'affichage pour un monstre
 * retenu dont le donjon a disparu de l'extraction fraîche (rétention promote).
 */
export function committedEncounters(): Record<string, DungeonRef> {
  return readGenerated<Record<string, DungeonRef>>('encounters.json') ?? {};
}

let siteIdsCache: { stamp: string; ids: Set<string> } | undefined;

/**
 * Modes de contenu que le SITE ne documente pas par monstre : le narratif
 * (story/side/tutoriel) et l'événementiel rotatif sans page dédiée — leur
 * bruit (3 000+ mobs) est exclu du filtre « Utilisés par le site ». Décision
 * ÉDITORIALE (pas une donnée du jeu) ; tout NOUVEAU mode est inclus d'office.
 */
const NON_SITE_MODES = new Set([
  'normal', // story principale
  'adventure_mission', // missions de story
  'sidestory',
  'tutorial',
  'event', // stages d'événements rotatifs
  'event_challenge', // rank challenge d'événements rotatifs
  'ivanez_dungeon', // Mirsha Festival (événement)
]);

/**
 * Monstres UTILISÉS PAR LE SITE :
 *   - réfs directes des données servies — content-schedule (world boss, guild
 *     raid main+sub, joint challenge), singularity, towers, boss d'obtention
 *     d'équipement (sources + curé) — et leurs donjons ;
 *   - les boss référencés par un GUIDE (`meta.bossId`) — certains ne spawnent
 *     que dans un mode exclu (adventure-license, story) ;
 *   - tout monstre spawnant dans un mode NON exclu (cf. `NON_SITE_MODES`) ;
 *   - les ADDS rattachés (`summonedBy`/`linkedTo` vers un monstre utilisé).
 */
export function siteMonsterIds(): Set<string> {
  // Cache stampé (même régime mtime que le reste — cf. TODO « caches périmés »
  // 17/07) : l'ensemble dérive des tables .gamedata (un refresh les réécrit
  // toutes → sentinelle TextSystem) ET du curé équipement (boss d'obtention,
  // éditable via l'admin → fileStamp). Recalcul quand l'un des deux bouge.
  // Les `meta.bossId` des guides ne sont PAS stampés : ce sont des fichiers de
  // `src/` — les toucher recompile le dev server, ce qui vide ce cache module.
  const stamp = `${tablesStamp(['TextSystem'])}|${fileStamp('data/curated/equipment.json')}`;
  if (siteIdsCache && siteIdsCache.stamp === stamp) return siteIdsCache.ids;
  const ids = new Set<string>();
  const dungeons = new Set<string>();

  const schedule = buildContentSchedule();
  for (const s of schedule.worldBoss) {
    if (s.boss) ids.add(s.boss);
    for (const m of s.monsters) ids.add(m);
    for (const d of s.dungeons) dungeons.add(d);
  }
  for (const s of schedule.guildRaid) {
    for (const b of s.bosses) {
      for (const m of b.monsters) ids.add(m);
      for (const d of b.dungeons) dungeons.add(d);
    }
  }
  for (const s of schedule.jointChallenge) {
    if (s.boss) ids.add(s.boss);
    for (const d of s.dungeons) dungeons.add(d);
  }
  for (const g of buildSingularity().groups) {
    for (const b of g.bosses) {
      for (const m of b.monsters) ids.add(m);
      dungeons.add(b.dungeon);
    }
  }
  for (const t of Object.values(buildTowers())) {
    for (const f of t.floors) {
      dungeons.add(f.dungeon);
      // `waves` (successives) ou `encounters` (pool aléatoire de la very hard).
      for (const w of [...(f.waves ?? []), ...(f.encounters ?? [])])
        for (const u of w) ids.add(u.id);
    }
  }

  // Boss d'obtention d'équipement (equipment/bosses.json : sources extraites
  // + complément curé) — donjons quotidiens, Special Request, licences…
  for (const s of Object.values(buildItemSources().items)) for (const b of s.bosses) ids.add(b);
  for (const b of curatedBossIds(loadEquipmentCurated())) ids.add(b);

  // Boss RÉFÉRENCÉS PAR UN GUIDE (`meta.bossId`). Indispensable : certains ne
  // spawnent QUE dans un mode exclu par `NON_SITE_MODES` (adventure-license,
  // story) — sans ça, une page de guide servirait un monstre hors périmètre et
  // ses écarts d'extraction seraient invisibles (21 cas au 20/07).
  for (const g of listGuides()) if (g.bossId) ids.add(g.bossId);

  const monsters = freshMonsters();
  const enc = buildEncounters();
  for (const m of Object.values(monsters)) {
    const spawns = m.spawns ?? [];
    if (spawns.some((s) => dungeons.has(s.dungeon))) ids.add(m.id);
    if (spawns.some((s) => !NON_SITE_MODES.has(enc.dungeons[s.dungeon]?.mode ?? ''))) {
      ids.add(m.id);
    }
  }
  // Adds : rattachés à un monstre utilisé (invocateur ou boss lié).
  for (const m of Object.values(monsters)) {
    if (ids.has(m.id)) continue;
    const anchors = [...(m.summonedBy ?? []), ...(m.linkedTo ?? [])];
    if (anchors.some((a) => ids.has(a))) ids.add(m.id);
  }

  siteIdsCache = { stamp, ids };
  return ids;
}

/**
 * Libellés HUMAINS des passifs de palier (`DungeonRank.options`) — depuis le
 * glossaire résolu `rankOptions` (generators/encounters, source unique) :
 * nom du tooltip du buff (« Increased Penetration », + marque irremovable) →
 * abréviation de la stat visée (« DMG UP ») → slug du type (« dmg reduce
 * final »). Valeur per-mille affichée en %.
 *
 * PAS le même contrat que `rankOptionLabels` du site (data/monsters.ts) : ici
 * EN seul et repli en cascade (diagnostic admin exhaustif) ; là-bas localisé
 * et option inconnue OMISE (rendu public). Nommés différemment exprès.
 */
export function rankOptionAdminLabels(ids: Iterable<string>): Record<string, string> {
  const opts = buildEncounters().rankOptions;
  const out: Record<string, string> = {};
  for (const id of ids) {
    if (out[id]) continue;
    const o = opts[id];
    if (!o) continue;
    const label =
      o.name?.en ??
      (o.stat
        ? statAbbr(o.stat).replace(/%$/, '')
        : o.type.replace(/^BT_/, '').replaceAll('_', ' ').toLowerCase());
    const irremovable = o.irremovable && o.name?.en ? ' (irremovable)' : '';
    // Signe seulement quand le libellé ne porte pas le sens (stat/tooltip) ;
    // les types « … reduce … » disent déjà la direction.
    const signed = Boolean(o.name?.en || o.stat);
    const value = o.value ? ` ${signed && o.value > 0 ? '+' : ''}${o.value / 10}%` : '';
    out[id] = `${label}${irremovable}${value}`;
  }
  return out;
}

let tooltipNamesCache: { stamp: string; names: Map<string, string> } | undefined;

/**
 * Nom EN d'un tooltip du jeu (`BuffToolTipTemplet`) — pour rendre LISIBLE une
 * réf d'immunité sans entrée au glossaire d'effets (« 64 » seul ne dit rien).
 *
 * Index stampé sur les tables (sentinelle TextSystem, comme partout) : un
 * refresh .gamedata le reconstruit sans redémarrage.
 */
export function tooltipName(id: string): string | undefined {
  const stamp = tablesStamp(['TextSystem']);
  if (!tooltipNamesCache || tooltipNamesCache.stamp !== stamp) {
    const sys = loadTextIndex('TextSystem');
    const skill = loadTextIndex('TextSkill');
    const names = new Map<string, string>();
    for (const r of loadTable('BuffToolTipTemplet')) {
      if (!r.ID || !r.NameID) continue;
      const name = resolveText(sys, r.NameID).en || resolveText(skill, r.NameID).en;
      if (name) names.set(r.ID, name);
    }
    tooltipNamesCache = { stamp, names };
  }
  return tooltipNamesCache.names.get(id);
}
