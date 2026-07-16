/**
 * INTÉGRATION PAR ENTITÉ — le geste de validation HUMAIN.
 *
 * `data/generated/` ne contient que du validé : rien n'y entre sans un clic
 * dans l'admin. Intégrer un perso =
 *   1. merger SON entrée (extraction fraîche) dans `characters.json` ;
 *   2. merger SES skills dans `skills.json` ;
 *   3. régénérer la carte des slugs (depuis le committé) ;
 *   4. stager SES images depuis les assets extraits du jeu (conversion webp).
 *
 * L'ordre des clés existantes est préservé (nouvelle entrée en fin) → diffs
 * git minimaux. Les sorties transverses (glossaires, transcend) restent du
 * ressort de la revue globale.
 *
 * Les écritures sont isolées dans des cœurs à chemin injectable
 * (`integrateCharacterData`, `integrateMonsterData`) : c'est la partie
 * destructive (merge dans les fichiers committés), donc la partie testée
 * (`integrate.test.ts`) — les wrappers publics ne font qu'y brancher
 * l'extraction fraîche et le staging d'images.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeJson as writeCanonicalJson } from '../lib/json';
import { characterAssetRequests, skillIconsOf } from '../assets/manifest';
import { buildImageIndex } from '../assets/source';
import { stageAssets, type StageResult } from '../assets/stage';
import { buildSkills } from '../generators/skills';
import { buildMonsterSkills } from '../generators/monster-skills';
import { buildEncounters } from '../generators/encounters';
import { buildSlugMap } from '../lib/slug';
import { buildCharacters } from './specs/character';
import type { Character } from './specs/character';
import { buildMonsters } from './specs/monster';
import type { Monster } from './specs/monster';

const GEN = resolve('data/generated');

type Dict = Record<string, unknown>;
// `dir` injectable : les tests travaillent sur un dossier temporaire, jamais
// sur le vrai `data/generated`.
const readJson = (dir: string, rel: string): Dict =>
  JSON.parse(readFileSync(resolve(dir, rel), 'utf8')) as Dict;
/** Comme `readJson`, mais `{}` si le fichier n'existe pas encore (1re intégration). */
const readJsonOr = (dir: string, rel: string): Dict => {
  try {
    return readJson(dir, rel);
  } catch {
    return {};
  }
};
// Écrit au format CANONIQUE (`lib/json`) — celui de `datagen:build` et des
// fichiers committés → le diff git se limite au perso intégré, sans re-mise en
// forme parasite du reste du fichier.
const writeJson = async (dir: string, rel: string, data: unknown): Promise<void> =>
  writeCanonicalJson(resolve(dir, rel), data);
/** Copie dans `into` les skills d'une entité présents dans `from` (référencés
 * par id) — LA boucle de collecte partagée par les bundles et les merges
 * d'intégration (perso, monstre, lot d'encounter). */
const pickSkills = (ids: readonly string[], from: Dict, into: Dict = {}): Dict => {
  for (const sid of ids) if (from[sid]) into[sid] = from[sid];
  return into;
};

export interface IntegrateReport {
  id: string;
  /** Fichiers de données écrits. */
  files: string[];
  /** Bilan du staging d'images (produits / déjà là / manquants). */
  assets: StageResult;
}

/** Le personnage tel que l'EXTRACTION FRAÎCHE le voit (proposition, non committé). */
export function extractedCharacter(id: string): Character | undefined {
  return buildCharacters().characters[id];
}

/** Perso frais + SES skills frais (la vue « extracteur » complète de l'admin). */
export function extractedBundle(
  id: string,
): { char: Character; skills: Record<string, unknown> } | undefined {
  const char = buildCharacters().characters[id];
  if (!char) return undefined;
  return { char, skills: pickSkills(char.skills, buildSkills().skills) };
}

/**
 * Cœur DONNÉES de l'intégration perso (étapes 1–3) : merge de l'entité, de
 * ses skills et régénération des slugs dans `dir`. Séparé du wrapper pour
 * être testable sur un dossier temporaire (les écritures sont destructives).
 * Retourne les fichiers écrits.
 */
export async function integrateCharacterData(
  dir: string,
  char: Character,
  freshSkills: Record<string, unknown>,
): Promise<string[]> {
  // 1) Donnée du perso.
  const characters = readJson(dir, 'characters.json');
  characters[char.id] = char;
  await writeJson(dir, 'characters.json', characters);

  // 2) Ses skills (référencés par id).
  const skills = pickSkills(char.skills, freshSkills, readJson(dir, 'skills.json'));
  await writeJson(dir, 'skills.json', skills);

  // 3) Slugs, dérivés du committé à jour.
  await writeJson(
    dir,
    'characters-slug-to-id.json',
    buildSlugMap(Object.values(characters) as unknown as Character[]),
  );

  return ['characters.json', 'skills.json', 'characters-slug-to-id.json'];
}

/** Intègre UN personnage : données + images. Déclenché par l'admin uniquement. */
export async function integrateCharacter(id: string): Promise<IntegrateReport> {
  const fresh = buildCharacters();
  const char = fresh.characters[id];
  if (!char) throw new Error(`perso ${id} absent de l'extraction fraîche`);
  const freshSkills = buildSkills().skills;

  // 1–3) Données (entité + skills + slugs).
  const files = await integrateCharacterData(GEN, char, freshSkills);

  // 4) Ses images, depuis les assets extraits du jeu.
  const index = buildImageIndex();
  const requests = characterAssetRequests(
    char as unknown as Record<string, unknown>,
    skillIconsOf(char as unknown as Record<string, unknown>, freshSkills as never),
  );
  const assets = await stageAssets(requests, index);

  return { id, files, assets };
}

// --- monstres ------------------------------------------------------------------

/** Monstre frais + SES skills frais (la vue « extracteur » de l'admin). */
export function extractedMonsterBundle(
  id: string,
): { monster: Monster; skills: Record<string, unknown> } | undefined {
  const monster = buildMonsters().monsters[id];
  if (!monster) return undefined;
  return { monster, skills: pickSkills(monster.skills, buildMonsterSkills().skills) };
}

export interface IntegrateMonsterReport {
  id: string;
  files: string[];
}

/**
 * Intègre UN monstre (bouton « Enregistrer » de l'admin) : son entrée dans
 * `monsters.json` (localisation `spawns`/`summonedBy`/`linkedTo` incluse), ses
 * skills dans `monster-skills.json`, et les DONJONS référencés par ses spawns
 * dans `encounters.json` (sinon réfs pendantes côté site). Les titres de modes
 * (`glossaries.modes`) restent du ressort de la revue globale, comme tout
 * glossaire. Pas d'images ici (les portraits `MT_*` relèvent du manifest
 * d'assets global).
 */
export async function integrateMonster(id: string): Promise<IntegrateMonsterReport> {
  const monster = buildMonsters().monsters[id];
  if (!monster) throw new Error(`monstre ${id} absent de l'extraction fraîche`);
  const freshSkills = buildMonsterSkills().skills;

  const files = await integrateMonsterData(
    GEN,
    monster,
    freshSkills,
    () => buildEncounters().dungeons,
  );
  return { id, files };
}

/**
 * Cœur DONNÉES de l'intégration monstre : merge de l'entité, de ses skills et
 * des donjons de ses spawns dans `dir`. `freshDungeons` est PARESSEUX : les
 * encounters ne sont construits (et `encounters.json` touché) que si le
 * monstre spawne quelque part — même contrat que l'original. Retourne les
 * fichiers écrits.
 */
export async function integrateMonsterData(
  dir: string,
  monster: Monster,
  freshSkills: Record<string, unknown>,
  freshDungeons: () => Record<string, unknown>,
): Promise<string[]> {
  const monsters = readJsonOr(dir, 'monsters.json');
  monsters[monster.id] = monster;
  await writeJson(dir, 'monsters.json', monsters);

  const skills = pickSkills(monster.skills, freshSkills, readJsonOr(dir, 'monster-skills.json'));
  await writeJson(dir, 'monster-skills.json', skills);

  const files = ['monsters.json', 'monster-skills.json'];
  if (monster.spawns?.length) {
    const dungeons = freshDungeons();
    const encounters = readJsonOr(dir, 'encounters.json');
    for (const s of monster.spawns) {
      if (dungeons[s.dungeon]) encounters[s.dungeon] = dungeons[s.dungeon];
    }
    await writeJson(dir, 'encounters.json', encounters);
    files.push('encounters.json');
  }

  return files;
}

export interface IntegrateModeReport {
  mode: string;
  /** Ids intégrés (spawnés dans le mode + adds rattachés). */
  ids: string[];
  files: string[];
}

/**
 * Intègre TOUS les monstres d'un MODE DE JEU (bouton « Enregistrer le mode »
 * du listing admin) : ceux qui SPAWNENT dans un donjon du mode, plus leurs
 * ADDS rattachés (`summonedBy`/`linkedTo` vers un monstre du lot — un boss
 * sans ses adds casse la vue kit côté site). Mêmes effets que
 * `integrateMonster`, en UNE lecture/écriture par fichier.
 */
export async function integrateMonsterMode(mode: string): Promise<IntegrateModeReport> {
  const fresh = buildMonsters().monsters;
  const freshSkills = buildMonsterSkills().skills;
  const enc = buildEncounters();

  const ids = new Set<string>();
  for (const m of Object.values(fresh)) {
    if ((m.spawns ?? []).some((s) => enc.dungeons[s.dungeon]?.mode === mode)) ids.add(m.id);
  }
  if (!ids.size) throw new Error(`aucun monstre ne spawne dans le mode « ${mode} »`);
  for (const m of Object.values(fresh)) {
    if (ids.has(m.id)) continue;
    const anchors = [...(m.summonedBy ?? []), ...(m.linkedTo ?? [])];
    if (anchors.some((a) => ids.has(a))) ids.add(m.id);
  }

  const monsters = readJsonOr(GEN, 'monsters.json');
  const skills = readJsonOr(GEN, 'monster-skills.json');
  const encounters = readJsonOr(GEN, 'encounters.json');
  for (const id of ids) {
    const m = fresh[id];
    monsters[id] = m;
    pickSkills(m.skills, freshSkills, skills);
    for (const s of m.spawns ?? []) {
      if (enc.dungeons[s.dungeon]) encounters[s.dungeon] = enc.dungeons[s.dungeon];
    }
  }
  await writeJson(GEN, 'monsters.json', monsters);
  await writeJson(GEN, 'monster-skills.json', skills);
  await writeJson(GEN, 'encounters.json', encounters);

  return {
    mode,
    ids: [...ids].sort(),
    files: ['monsters.json', 'monster-skills.json', 'encounters.json'],
  };
}
