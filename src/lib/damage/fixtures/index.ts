/**
 * Registre des fixtures « dorées » (harnais § 3) : scénarios VÉRIFIÉS EN JEU,
 * un fichier JSON par capture dans CE dossier, importé et listé ici — le
 * panneau Debug les affiche, `fixtures.test.ts` (harnais § 4) les rejoue sans
 * UI. Le bouton « Capturer ce scénario » compose le JSON ; les dégâts
 * `observed` pré-remplis (calculés) sont à CORRIGER avec les valeurs
 * constatées en jeu avant de committer.
 */

import type { DamageFixture } from '../harness';

export const FIXTURES: DamageFixture[] = [
  // import delta_s3_wb from './delta-s3-wb.json' → ...(delta_s3_wb as DamageFixture)
];
