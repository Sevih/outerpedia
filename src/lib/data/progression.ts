/**
 * Accès aux barèmes de PROGRESSION (`data/generated/progression.json` :
 * évolutions, limit break, premium, codex, quirks). Le domaine complet
 * (fiche perso) vit dans `char-progression.ts` ; ce module ne sert que le
 * fichier brut aux outils qui en lisent une table.
 */
import type { ProgressionData } from '@contracts';
import progressionData from '@data/generated/progression.json';

const PROGRESSION = progressionData as unknown as ProgressionData;

export function getProgression(): ProgressionData {
  return PROGRESSION;
}
