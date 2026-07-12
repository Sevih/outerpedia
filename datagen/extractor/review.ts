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
import { diffEntity, diffRecords, type FieldDiff, type RecordDiff } from './core/changes';
import { getTarget, TARGETS, type GeneratedTarget } from './targets';

const GENERATED = resolve('data/generated');

function readCommitted(file: string): Record<string, unknown> {
  try {
    return JSON.parse(readFileSync(resolve(GENERATED, file), 'utf8')) as Record<string, unknown>;
  } catch {
    return {};
  }
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
  const existing = readCommitted(target.file);
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
  const existing = readCommitted(target.file);
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
 * au format CANONIQUE de `build.ts` (cf. `lib/json`). L'utilisateur committe
 * ensuite via git. NB : les sorties transverses (glossaires, relations) restent
 * du ressort de `pnpm datagen:build`.
 */
export async function acceptTarget(id: string): Promise<void> {
  const target = getTarget(id);
  if (!target) throw new Error(`cible inconnue : ${id}`);
  const fresh = target.build();
  await writeJson(resolve(GENERATED, target.file), fresh);
}
