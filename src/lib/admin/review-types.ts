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
export type {
  EntityReview,
  EntityStatus,
  ReviewEntity,
  ReviewEntityStatus,
  TargetReview,
} from '@datagen/extractor/review';
