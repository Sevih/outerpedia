/**
 * REVUE DE MAINTENANCE — « le jeu a bougé, qu'est-ce qui change ? ».
 *
 * Confronte la donnée committée (`data/generated/*`) à une extraction FRAÎCHE
 * (registre `targets`), via le moteur de diff générique. Permet de relire un
 * patch champ par champ AVANT de l'accepter — puis d'écrire à l'identique de
 * `build.ts` (même format) pour un diff git propre.
 *
 * Un seul moteur pour toutes les entités (≠ V2 : une route de diff par entité).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeJson } from '../lib/json';
import {
  diffBuckets,
  diffEntity,
  diffRecords,
  isTypoEntity,
  type DiffBuckets,
  type FieldDiff,
  type RecordDiff,
} from './core/changes';
import { getTarget, TARGETS, type GeneratedTarget } from './targets';

const GENERATED = resolve('data/generated');

function readCommitted(file: string): Record<string, unknown> {
  try {
    return JSON.parse(readFileSync(resolve(GENERATED, file), 'utf8')) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/** Committé de la cible — sous-objet `subKey` extrait si fichier partagé. */
function committedOf(target: GeneratedTarget): Record<string, unknown> {
  const raw = readCommitted(target.file);
  if (!target.subKey) return raw;
  return (raw[target.subKey] as Record<string, unknown>) ?? {};
}

/**
 * Écrit la donnée d'une cible au format canonique de `build.ts`. Cible à
 * fichier partagé (`subKey`) : on relit le fichier et on n'écrase QUE ce
 * sous-objet, en préservant le reste (les autres clés du glossaire).
 */
async function writeBack(target: GeneratedTarget, data: Record<string, unknown>): Promise<void> {
  const path = resolve(GENERATED, target.file);
  if (!target.subKey) {
    await writeJson(path, data);
    return;
  }
  await writeJson(path, { ...readCommitted(target.file), [target.subKey]: data });
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

/** Répartition new / diff / typo / removed d'une revue (pour la matrice admin). */
export function reviewBuckets(diff: RecordDiff): DiffBuckets {
  return diffBuckets(diff);
}

export type ReviewEntityStatus = 'new' | 'diff' | 'typo' | 'removed';

/** Une entité de la revue, statut déjà classé (pour la liste filtrable). */
export interface ReviewEntity {
  key: string;
  status: ReviewEntityStatus;
  /** Feuilles divergentes (vide pour new/removed). */
  fields: FieldDiff[];
}

/** Aplati un `RecordDiff` en liste d'entités classées new / diff / typo / removed. */
export function reviewEntities(diff: RecordDiff): ReviewEntity[] {
  return [
    ...diff.added.map((key): ReviewEntity => ({ key, status: 'new', fields: [] })),
    ...diff.changed.map((e): ReviewEntity => ({
      key: e.key,
      status: isTypoEntity(e) ? 'typo' : 'diff',
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
 * VALIDE une cible : écrit l'extraction fraîche dans `data/generated/<file>`,
 * au format CANONIQUE de `build.ts` (cf. `lib/json`). Cible à `subKey` : seul
 * ce sous-objet est réécrit (le reste du fichier est préservé). L'utilisateur
 * committe ensuite via git. NB : les sorties transverses (relations…) restent
 * du ressort de `pnpm datagen:build`.
 */
export async function acceptTarget(id: string): Promise<void> {
  const target = getTarget(id);
  if (!target) throw new Error(`cible inconnue : ${id}`);
  await writeBack(target, target.build());
}

/**
 * Applique UNIQUEMENT les corrections typographiques : remplace, dans le
 * committé, les seules entités dont TOUS les champs changés sont typo (le reste
 * — vrais écarts, nouveaux, disparus — est laissé tel quel, à arbitrer). Renvoie
 * le nombre d'entités corrigées.
 */
export async function acceptTypos(id: string): Promise<number> {
  const target = getTarget(id);
  if (!target) throw new Error(`cible inconnue : ${id}`);
  const committed = committedOf(target);
  const fresh = target.build();
  const typoKeys = diffRecords(committed, fresh)
    .changed.filter(isTypoEntity)
    .map((e) => e.key);
  if (!typoKeys.length) return 0;
  const merged = { ...committed };
  for (const k of typoKeys) merged[k] = fresh[k];
  await writeBack(target, merged);
  return typoKeys.length;
}
