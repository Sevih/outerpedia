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
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { format } from 'prettier';
import { characterAssetRequests, skillIconsOf } from '../assets/manifest';
import { buildImageIndex } from '../assets/source';
import { stageAssets, type StageResult } from '../assets/stage';
import { buildSkills } from '../generators/skills';
import { buildSlugMap } from '../lib/slug';
import { buildCharacters } from './specs/character';
import type { Character } from './specs/character';

const GEN = resolve('data/generated');

type Dict = Record<string, unknown>;
const readJson = (rel: string): Dict => JSON.parse(readFileSync(resolve(GEN, rel), 'utf8')) as Dict;
// Écrit au format PRETTIER (celui des fichiers committés) → diffs git minimaux,
// limités au perso intégré (pas de re-mise en forme parasite).
const writeJson = async (rel: string, data: unknown): Promise<void> =>
  writeFileSync(
    resolve(GEN, rel),
    await format(JSON.stringify(data), { parser: 'json', filepath: rel }),
  );

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
  const all = buildSkills().skills;
  const skills: Record<string, unknown> = {};
  for (const sid of char.skills) if (all[sid]) skills[sid] = all[sid];
  return { char, skills };
}

/** Intègre UN personnage : données + images. Déclenché par l'admin uniquement. */
export async function integrateCharacter(id: string): Promise<IntegrateReport> {
  const fresh = buildCharacters();
  const char = fresh.characters[id];
  if (!char) throw new Error(`perso ${id} absent de l'extraction fraîche`);
  const freshSkills = buildSkills().skills;

  // 1) Donnée du perso.
  const characters = readJson('characters.json');
  characters[id] = char;
  await writeJson('characters.json', characters);

  // 2) Ses skills (référencés par id).
  const skills = readJson('skills.json');
  for (const sid of char.skills) {
    if (freshSkills[sid]) skills[sid] = freshSkills[sid];
  }
  await writeJson('skills.json', skills);

  // 3) Slugs, dérivés du committé à jour.
  await writeJson(
    'characters-slug-to-id.json',
    buildSlugMap(Object.values(characters) as unknown as Character[]),
  );

  // 4) Ses images, depuis les assets extraits du jeu.
  const index = buildImageIndex();
  const requests = characterAssetRequests(
    char as unknown as Record<string, unknown>,
    skillIconsOf(char as unknown as Record<string, unknown>, freshSkills as never),
  );
  const assets = await stageAssets(requests, index);

  return {
    id,
    files: ['characters.json', 'skills.json', 'characters-slug-to-id.json'],
    assets,
  };
}
