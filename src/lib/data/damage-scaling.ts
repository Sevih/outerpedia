/** Accès aux ÉCHELLES de dégâts par skill (`data/generated/damage-scaling.json`, calculateur). */
import type { DamageScalingFile } from '@contracts';
import scalingData from '@data/generated/damage-scaling.json';

const SCALING = scalingData as unknown as DamageScalingFile;

export function getDamageScaling(): DamageScalingFile {
  return SCALING;
}
