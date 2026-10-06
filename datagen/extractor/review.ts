/**
 * REVUE DE MAINTENANCE — « le jeu a bougé, qu'est-ce qui change ? ».
 *
 * Confronte la donnée committée (`data/generated/*`) à une extraction FRAÎCHE
 * (registre `targets`), via le moteur de diff générique. Permet de relire un
 * patch champ par champ AVANT de l'accepter — puis d'écrire à l'identique de
 * `build.ts` (même format) pour un diff git propre.
 *
 * Un seul moteur pour toutes les entités (avant : une route de diff par entité).
 */
import { resolve } from 'node:path';
import { readCuratedJson, writeJson } from '../lib/json';
import { changedIntegratedIds, stageCharacterAssets } from '../assets/stage-characters';
import { stageEntityAssets, stagesEntityAssets } from '../assets/stage-entities';
import type { StageResult } from '../assets/stage';
import { buildSkills } from '../generators/skills';
import {
  diffBuckets,
  diffEntity,
  diffRecords,
  isMinorEntity,
  isTypoEntity,
  type DiffBuckets,
  type FieldDiff,
  type RecordDiff,
} from './core/changes';
import { getTarget, TARGETS, type GeneratedTarget } from './targets';

const GENERATED = resolve('data/generated');

type Dict = Record<string, unknown>;

// `dir` injectable sur les lectures/écritures : les tests d'`acceptMinorIn`
// travaillent sur un dossier temporaire, jamais sur le vrai `data/generated`.
function readCommitted(file: string, dir = GENERATED): Dict {
  // Committé ABSENT (cible jamais générée) → `{}` : tout est vu comme « new »,
  // cas normal. Committé PRÉSENT mais CASSÉ → `readCuratedJson` LÈVE en nommant
  // le fichier — jamais un `{}` silencieux qui ferait voir TOUTES les entités
  // comme « new » (diff faussé) et, au `writeBack` d'une cible à `subKey`,
  // ÉCRASERAIT les autres clés du fichier partagé (audit X2).
  return readCuratedJson<Dict>(resolve(dir, file)) ?? {};
}

/** Committé de la cible — sous-objet `subKey` extrait si fichier partagé. */
function committedOf(target: GeneratedTarget, dir = GENERATED): Dict {
  const raw = readCommitted(target.file, dir);
  if (!target.subKey) return raw;
  return (raw[target.subKey] as Dict) ?? {};
}

/**
 * Écrit la donnée d'une cible au format canonique de `build.ts`. Cible à
 * fichier partagé (`subKey`) : on relit le fichier et on n'écrase QUE ce
 * sous-objet, en préservant le reste (les autres clés du glossaire).
 */
async function writeBack(target: GeneratedTarget, data: Dict, dir = GENERATED): Promise<void> {
  const path = resolve(dir, target.file);
  if (!target.subKey) {
    await writeJson(path, data);
    return;
  }
  await writeJson(path, { ...readCommitted(target.file, dir), [target.subKey]: data });
}

export interface TargetReview {
  id: string;
  label: string;
  file: string;
  diff: RecordDiff;
}

/** Compteur d'écarts d'une revue (pour les index/badges). */
export function reviewTotals(diff: RecordDiff): number {
  return diff.added.length + diff.removed.length + diff.changed.length;
}

/** Répartition new / diff / minor / typo / removed d'une revue (pour la matrice admin). */
export function reviewBuckets(diff: RecordDiff): DiffBuckets {
  return diffBuckets(diff);
}

/**
 * `minor` = retouche mineure (texte reformulé, costume ajouté ou déplacé — cf.
 * `isMinorEntity`), `typo` = coquille pure ; les deux s'appliquent d'un geste
 * (`acceptMinor`) sans ré-intégrer l'entité.
 */
export type ReviewEntityStatus = 'new' | 'diff' | 'minor' | 'typo' | 'removed';

/** Une entité de la revue, statut déjà classé (pour la liste filtrable). */
export interface ReviewEntity {
  key: string;
  status: ReviewEntityStatus;
  /** Feuilles divergentes (vide pour new/removed). */
  fields: FieldDiff[];
}

/** Aplati un `RecordDiff` en liste d'entités classées new / diff / minor / typo / removed. */
export function reviewEntities(diff: RecordDiff): ReviewEntity[] {
  return [
    ...diff.added.map((key): ReviewEntity => ({ key, status: 'new', fields: [] })),
    ...diff.changed.map((e): ReviewEntity => ({
      key: e.key,
      status: isTypoEntity(e) ? 'typo' : isMinorEntity(e) ? 'minor' : 'diff',
      fields: e.fields,
    })),
    ...diff.removed.map((key): ReviewEntity => ({ key, status: 'removed', fields: [] })),
  ];
}

/** Revue d'une cible : committé vs extraction fraîche. */
export function reviewTarget(id: string): TargetReview {
  const target = getTarget(id);
  if (!target) throw new Error(`cible inconnue : ${id}`);
  return runReview(target);
}

/**
 * Extraction FRAÎCHE d'une cible (clé d'entité → objet) — sert à résoudre un
 * libellé par entité côté UI (ex. le nom d'un item, y compris un nouveau, absent
 * du committé). Appelé juste après `reviewTarget`, la mémoïsation du build
 * (cibles lourdes : équipement, catalogue d'items) le rend gratuit.
 */
export function targetBuild(id: string): Record<string, unknown> {
  const target = getTarget(id);
  if (!target) throw new Error(`cible inconnue : ${id}`);
  return target.build();
}

/** Revue de toutes les cibles déclarées. */
export function reviewAll(): TargetReview[] {
  return TARGETS.map(runReview);
}

export type EntityStatus = 'added' | 'removed' | 'changed' | 'same';

export interface EntityReview {
  status: EntityStatus;
  /** Feuilles divergentes (vide hors `changed`). */
  fields: FieldDiff[];
}

/**
 * Revue d'UNE entité (ex. un perso) : committé vs extraction fraîche. Sert à
 * afficher l'écart directement sur la fiche admin de l'entité — là où on
 * intervient — plutôt que dans une surface de revue séparée.
 */
export function entityReview(id: string, key: string): EntityReview {
  const target = getTarget(id);
  if (!target) throw new Error(`cible inconnue : ${id}`);
  const existing = committedOf(target);
  const extracted = target.build();
  const inOld = key in existing;
  const inNew = key in extracted;
  if (inOld && !inNew) return { status: 'removed', fields: [] };
  if (!inOld && inNew) return { status: 'added', fields: [] };
  if (!inOld && !inNew) return { status: 'same', fields: [] };
  const fields = diffEntity(existing[key], extracted[key]);
  return { status: fields.length ? 'changed' : 'same', fields };
}

function runReview(target: GeneratedTarget): TargetReview {
  const existing = committedOf(target);
  const extracted = target.build();
  return {
    id: target.id,
    label: target.label,
    file: target.file,
    diff: diffRecords(existing, extracted),
  };
}

/**
 * Bilan d'une écriture de cible : images mises en place (cibles des persos, des
 * monstres et de l'équipement — `undefined` pour les autres).
 */
export interface AcceptReport {
  assets?: StageResult;
}

/** Stagers d'une cible — injectables pour tester le branchement sans rien stager. */
export interface StageChangedDeps {
  /** Persos (défaut : `stageCharacterAssets`, icônes de skills du catalogue frais). */
  characters?: (ids: string[], characters: Dict) => Promise<StageResult>;
  /** Monstres et équipement (défaut : `stageEntityAssets`). */
  entities?: (file: string, ids: string[], entities: Dict) => Promise<StageResult>;
}

/**
 * Images des entités DÉJÀ VALIDÉES que l'écriture vient de modifier, restreintes
 * à `ids` et lues dans `entities` (le contenu écrit) :
 *   - persos : l'étape 5 de l'intégration (cf. `assets/stage-characters.ts`) —
 *     un costume ajouté a son full art et le visage de son apparence sans
 *     qu'on ré-intègre personne ; icônes de skills du catalogue frais, comme à
 *     l'intégration ;
 *   - monstres et équipement (reconnus au fichier de la cible) : vignette
 *     `MT_`, tuile et icônes de passifs (cf. `assets/stage-entities.ts`).
 * Autres cibles (effets, items), ou aucun id : rien (`undefined`).
 */
export async function stageChangedEntities(
  target: GeneratedTarget,
  ids: string[],
  entities: Dict,
  deps: StageChangedDeps = {},
): Promise<StageResult | undefined> {
  if (!ids.length) return undefined;
  if (target.id === 'character') {
    const stage =
      deps.characters ??
      ((i: string[], c: Dict) =>
        stageCharacterAssets(i, c, buildSkills().skills as unknown as Record<string, Dict>));
    return stage(ids, entities);
  }
  if (stagesEntityAssets(target.file))
    return (deps.entities ?? stageEntityAssets)(target.file, ids, entities);
  return undefined;
}

/**
 * VALIDE une cible : écrit l'extraction fraîche dans `data/generated/<file>`,
 * au format CANONIQUE de `build.ts` (cf. `lib/json`). Cible à `subKey` : seul
 * ce sous-objet est réécrit (le reste du fichier est préservé). L'utilisateur
 * committe ensuite via git. NB : les sorties transverses (relations…) restent
 * du ressort de `pnpm datagen:build`. Cibles des persos, des monstres et de
 * l'équipement : met aussi en place les images des entités déjà validées dont
 * l'entrée change (les nouvelles ne sont jamais stagées par ici).
 */
export async function acceptTarget(id: string): Promise<AcceptReport> {
  const target = getTarget(id);
  if (!target) throw new Error(`cible inconnue : ${id}`);
  const committed = committedOf(target);
  const fresh = target.build();
  await writeBack(target, fresh);
  const assets = await stageChangedEntities(target, changedIntegratedIds(committed, fresh), fresh);
  return { assets };
}

/**
 * Cœur PUR de l'application des retouches : fusionne dans `committed` les
 * seules entités de `fresh` dont TOUS les champs changés sont typo ou mineurs
 * (le reste — vrais écarts, nouveaux, disparus — est laissé tel quel, à
 * arbitrer). Les clés sont rendues par sorte, pour le compte rendu.
 */
export function mergeMinor(
  committed: Dict,
  fresh: Dict,
): { merged: Dict; typo: string[]; minor: string[] } {
  const typo: string[] = [];
  const minor: string[] = [];
  for (const e of diffRecords(committed, fresh).changed) {
    if (isTypoEntity(e)) typo.push(e.key);
    else if (isMinorEntity(e)) minor.push(e.key);
  }
  const merged = { ...committed };
  for (const k of [...typo, ...minor]) merged[k] = fresh[k];
  return { merged, typo, minor };
}

/**
 * Applique les retouches mineures (typo comprises) d'une cible dans `dir` :
 * n'écrit que si au moins une entité est concernée. Séparé du wrapper pour
 * être testable sur un dossier temporaire (l'écriture est destructive).
 */
export async function acceptMinorIn(
  dir: string,
  target: GeneratedTarget,
): Promise<{ typo: string[]; minor: string[] }> {
  const { merged, typo, minor } = mergeMinor(committedOf(target, dir), target.build());
  if (typo.length + minor.length) await writeBack(target, merged, dir);
  return { typo, minor };
}

/** Bilan d'`acceptMinor` : entités appliquées par sorte, images mises en place. */
export interface MinorReport extends AcceptReport {
  typo: number;
  minor: number;
}

/**
 * Applique UNIQUEMENT les retouches mineures et les corrections typographiques
 * (« Appliquer les retouches mineures » de la revue) — remplace l'ancien
 * `acceptTypos`, qui ne prenait que les coquilles. Cibles des persos, des
 * monstres et de l'équipement : met en place les images des entités touchées
 * (costume ajouté → son full art).
 */
export async function acceptMinor(id: string): Promise<MinorReport> {
  const target = getTarget(id);
  if (!target) throw new Error(`cible inconnue : ${id}`);
  const { typo, minor } = await acceptMinorIn(GENERATED, target);
  const assets = await stageChangedEntities(target, [...typo, ...minor], committedOf(target));
  return { typo: typo.length, minor: minor.length, assets };
}
