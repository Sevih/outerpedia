/**
 * Registre des fixtures « dorées » (harnais § 3) : scénarios VÉRIFIÉS EN JEU,
 * un fichier JSON par capture dans CE dossier, importé et listé ici — le
 * panneau Debug les affiche, `fixtures.test.ts` (harnais § 4) les rejoue sans
 * UI. Le bouton « Capturer ce scénario » compose le JSON ; les dégâts
 * `observed` pré-remplis (calculés) sont à CORRIGER avec les valeurs
 * constatées en jeu avant de committer.
 */

import type { DamageFixture } from '../harness';
import valentineRhona from './valentine-rhona.json';
import noaRhona from './noa-rhona.json';
import noaChimera from './noa-chimera.json';

export const FIXTURES: DamageFixture[] = [
  valentineRhona as DamageFixture,
  noaRhona as DamageFixture,
  noaChimera as DamageFixture,
];
