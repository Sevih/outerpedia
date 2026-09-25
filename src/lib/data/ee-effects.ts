/**
 * Accès au vocabulaire des effets d'EE (`data/generated/ee-effects.json`,
 * porteur → effets comparables) — outil de contribution « ranking helper ».
 */
import type { EeEffectsData } from '@datagen/generators/ee-effects';
import eeEffectsData from '@data/generated/ee-effects.json';

const EE_EFFECTS = eeEffectsData as EeEffectsData;

export function getEeEffects(): EeEffectsData {
  return EE_EFFECTS;
}
