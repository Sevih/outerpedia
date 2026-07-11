/**
 * Accès app à la REVUE de maintenance (réservé à l'admin local).
 *
 * Mince façade sur le moteur `@datagen/extractor/review` : isole l'import datagen
 * (node:fs + tables de jeu) côté serveur, comme `curated-store` pour le curé.
 */
import {
  acceptTarget,
  entityReview,
  reviewAll,
  reviewTarget,
  reviewTotals,
  type EntityReview,
  type TargetReview,
} from '@datagen/extractor/review';
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
import {
  characterV2Control,
  type ControlGlossaries,
  type V2Control,
} from '@datagen/extractor/v2-control';

export type {
  EntityReview,
  TargetReview,
  IntegrateModeReport,
  IntegrateMonsterReport,
  IntegrateReport,
  V2Control,
  ControlGlossaries,
  VersionMonsterReport,
};
export {
  acceptTarget,
  characterV2Control,
  entityReview,
  extractedBundle,
  extractedCharacter,
  extractedMonsterBundle,
  integrateCharacter,
  integrateMonster,
  integrateMonsterMode,
  monsterArchiveOf,
  reviewAll,
  reviewTarget,
  reviewTotals,
  versionMonster,
};
