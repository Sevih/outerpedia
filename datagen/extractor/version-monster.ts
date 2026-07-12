/**
 * VERSIONNER UN MONSTRE/BOSS — figer un état VALIDÉ (entité + ses skills) dans
 * `data/generated/monster-archive/<id>@<n>.json` (append-only, committé).
 *
 * Cas d'usage : le jeu met à jour un boss EN PLACE (même id, contenu modifié)
 * alors que des guides ont été écrits contre l'ancien état — on fige l'ancien,
 * la nouvelle version du guide suit le live, l'ancienne reste épinglée sur
 * `<id>@<n>`. Geste HUMAIN, à jugement : une maj sans impact guide ne se
 * versionne pas. Voie normale = bouton « Versionner » de l'admin ; la CLI
 * (`datagen/version-boss.ts`) n'est que le rattrapage `--ref <vieux commit>`.
 *
 * Source par défaut : **git HEAD** = dernier état committé — celui contre
 * lequel les guides ont été écrits, même quand le dev auto-apply a déjà écrasé
 * le working tree avec le nouvel état. `worktree` = état du disque.
 *
 * TODO(guides) : quand le domaine guides existera, ce geste devra RÉ-ÉPINGLER
 * automatiquement les guides qui référencent `<id>` (live) vers `<id>@<n>` —
 * versionner ne doit JAMAIS demander d'éditer la config d'un guide à la main.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeJson } from '../lib/json';
import type { Glossaries, MonsterArchiveEntry } from '../contracts';
import type { Monster } from './specs/monster';
import type { DungeonRef } from '../generators/encounters';
import type { LangDict } from '../lib/lang';
import type { Skill } from '../generators/skills';

const ARCHIVE = () => resolve('data/generated/monster-archive');
const MONSTERS = 'data/generated/monsters.json';
const MONSTER_SKILLS = 'data/generated/monster-skills.json';
const ENCOUNTERS = 'data/generated/encounters.json';
const GLOSSARIES = 'data/generated/glossaries.json';
const GAME_VERSION = 'data/generated/game-version.json';

/** Contenu d'un fichier à une réf git (`undefined` si absent de la réf). */
function gitShow(ref: string, path: string): string | undefined {
  try {
    return execFileSync('git', ['show', `${ref}:${path}`], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return undefined;
  }
}

/** Contenu d'un fichier à la source demandée : réf git, ou disque (`worktree`). */
function readAt(ref: string, path: string): string | undefined {
  if (ref === 'worktree') {
    try {
      return readFileSync(resolve(path), 'utf8');
    } catch {
      return undefined;
    }
  }
  return gitShow(ref, path);
}

export interface VersionMonsterOptions {
  /** Réf git source (`HEAD` par défaut), ou `worktree` (état du disque). */
  ref?: string;
  /** Note humaine (« avant la maj 1.11 », …). */
  label?: string;
}

export interface VersionMonsterReport {
  /** Référence d'épinglage pour les guides : `<id>@<n>`. */
  key: string;
  id: string;
  version: number;
  /** Nom EN du monstre figé, si connu. */
  name?: string;
  /** Nombre de skills figés avec l'entité. */
  skills: number;
  /** Provenance (sha court ou `worktree`) + version du jeu si connue. */
  ref: string;
  gameVersion?: string;
  /** Chemin RELATIF du fichier écrit (`data/generated/monster-archive/…`). */
  file: string;
}

/** Versions déjà figées (index léger pour l'admin), plus récentes en dernier. */
export function monsterArchiveOf(id: string): MonsterArchiveEntry[] {
  const dir = ARCHIVE();
  if (!existsSync(dir)) return [];
  const pattern = new RegExp(`^${id}@(\\d+)\\.json$`);
  const out: MonsterArchiveEntry[] = [];
  for (const f of readdirSync(dir)) {
    if (!pattern.test(f)) continue;
    out.push(JSON.parse(readFileSync(resolve(dir, f), 'utf8')) as MonsterArchiveEntry);
  }
  return out.sort((a, b) => a.version - b.version);
}

/** Fige l'état de `id` à la source demandée. Lève si introuvable. */
export async function versionMonster(
  id: string,
  opts: VersionMonsterOptions = {},
): Promise<VersionMonsterReport> {
  const ref = opts.ref ?? 'HEAD';

  const monstersRaw = readAt(ref, MONSTERS);
  if (!monstersRaw) {
    throw new Error(
      `${MONSTERS} introuvable à \`${ref}\`` +
        (ref === 'HEAD' ? ' — pas encore committé ? (source `worktree` possible)' : ''),
    );
  }
  const monsters = JSON.parse(monstersRaw) as Record<string, Monster>;
  const monster = monsters[id];
  if (!monster) throw new Error(`monstre ${id} introuvable dans ${MONSTERS} à \`${ref}\``);

  const skillsRaw = readAt(ref, MONSTER_SKILLS);
  const allSkills = skillsRaw ? (JSON.parse(skillsRaw) as Record<string, Skill>) : {};
  const skills: Record<string, Skill> = {};
  for (const sid of monster.skills ?? []) if (allSkills[sid]) skills[sid] = allSkills[sid];

  // Localisation FIGÉE avec l'entité : snapshot des donjons référencés par ses
  // spawns (+ titres de modes) — l'archive reste lisible même si le donjon
  // disparaît du live (l'événement retiré, le stage re-niveauté…).
  const dungeons: Record<string, DungeonRef> = {};
  const modes: Record<string, LangDict> = {};
  if (monster.spawns?.length) {
    const encRaw = readAt(ref, ENCOUNTERS);
    const allDungeons = encRaw ? (JSON.parse(encRaw) as Record<string, DungeonRef>) : {};
    const glossRaw = readAt(ref, GLOSSARIES);
    const allModes = glossRaw ? ((JSON.parse(glossRaw) as Glossaries).modes ?? {}) : {};
    for (const s of monster.spawns) {
      const d = allDungeons[s.dungeon];
      if (!d) continue;
      dungeons[s.dungeon] = d;
      if (allModes[d.mode]) modes[d.mode] = allModes[d.mode];
    }
  }

  // Numéro de version : max existant + 1 (l'archive est append-only).
  const dir = ARCHIVE();
  mkdirSync(dir, { recursive: true });
  const last = monsterArchiveOf(id).at(-1);
  const n = (last?.version ?? 0) + 1;

  // Provenance : sha + date du commit source (ou l'instant présent en worktree).
  const source =
    ref === 'worktree'
      ? { ref: 'worktree', committedAt: new Date().toISOString() }
      : {
          ref: execFileSync('git', ['rev-parse', '--short', ref], { encoding: 'utf8' }).trim(),
          committedAt: execFileSync('git', ['log', '-1', '--format=%cI', ref], {
            encoding: 'utf8',
          }).trim(),
        };
  const gvRaw = readAt(ref, GAME_VERSION);
  const gameVersion = gvRaw ? (JSON.parse(gvRaw) as { resVersion?: string }).resVersion : undefined;

  const entry: MonsterArchiveEntry = {
    id,
    version: n,
    ...source,
    ...(gameVersion ? { gameVersion } : {}),
    ...(opts.label ? { label: opts.label } : {}),
    monster,
    skills,
    ...(Object.keys(dungeons).length ? { dungeons } : {}),
    ...(Object.keys(modes).length ? { modes } : {}),
  };
  const file = `data/generated/monster-archive/${id}@${n}.json`;
  await writeJson(resolve(file), entry);

  return {
    key: `${id}@${n}`,
    id,
    version: n,
    ...(monster.name?.en ? { name: monster.name.en } : {}),
    skills: Object.keys(skills).length,
    ref: source.ref,
    ...(gameVersion ? { gameVersion } : {}),
    file,
  };
}
