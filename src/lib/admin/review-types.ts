/**
 * Types SEULS de la revue, sûrs à importer côté client.
 *
 * `export type` est effacé à la compilation → aucun code datagen (node:fs, tables
 * de jeu) n'entre dans le bundle client, contrairement à `review-store`.
 */
export type {
  DiffBuckets,
  FieldDiff,
  EntityDiff,
  RecordDiff,
} from '@datagen/extractor/core/changes';
import type { ReviewEntity } from '@datagen/extractor/review';

export type {
  EntityReview,
  EntityStatus,
  ReviewEntity,
  ReviewEntityStatus,
  TargetReview,
} from '@datagen/extractor/review';
export type { EquipmentEntityKind } from '@datagen/extractor/integrate-equipment';

/** Entité de revue enrichie d'un nom lisible (résolu côté serveur). */
export type NamedReviewEntity = ReviewEntity & { name: string };
