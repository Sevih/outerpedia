/**
 * Accès aux barèmes de CROISSANCE des héros (`data/generated/hero-growth.json` :
 * limit break, montée de skills, enchant, XP) — guide Growth Systems et suivi
 * de compte.
 */
import type { HeroGrowthData } from '@contracts';
import growthData from '@data/generated/hero-growth.json';

const GROWTH = growthData as unknown as HeroGrowthData;

export function getHeroGrowth(): HeroGrowthData {
  return GROWTH;
}
