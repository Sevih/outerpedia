/**
 * Accès app à la REVUE de maintenance (réservé à l'admin local).
 *
 * Mince façade sur le moteur `@datagen/extractor/review` : isole l'import datagen
 * (node:fs + tables de jeu) côté serveur, comme `curated-store` pour le curé.
 */
import {
  acceptTarget,
  acceptTypos,
  entityReview,
  reviewAll,
  reviewBuckets,
  reviewEntities,
  reviewTarget,
  reviewTotals,
  type EntityReview,
  type ReviewEntity,
  type TargetReview,
} from '@datagen/extractor/review';
import type { DiffBuckets } from '@datagen/extractor/core/changes';
import {
  extractedBundle,
  extractedCharacter,
  extractedMonsterBundle,
  integrateCharacter,
  integrateMonster,
  integrateMonsterMode,
  type IntegrateModeReport,
  type IntegrateMonsterReport,
  type IntegrateReport,
} from '@datagen/extractor/integrate';
import {
  monsterArchiveOf,
  versionMonster,
  type VersionMonsterReport,
} from '@datagen/extractor/version-monster';

export type {
  DiffBuckets,
  EntityReview,
  ReviewEntity,
  TargetReview,
  IntegrateModeReport,
  IntegrateMonsterReport,
  IntegrateReport,
  VersionMonsterReport,
};
export {
  acceptTarget,
  acceptTypos,
  entityReview,
  extractedBundle,
  extractedCharacter,
  extractedMonsterBundle,
  integrateCharacter,
  integrateMonster,
  integrateMonsterMode,
  monsterArchiveOf,
  reviewAll,
  reviewBuckets,
  reviewEntities,
  reviewTarget,
  reviewTotals,
  versionMonster,
};
