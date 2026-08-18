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
import rhonaMeteos from './rhona-meteos.json';
import carenMeteos from './caren-meteos.json';
import carenAmadeus from './caren-amadeus.json';

export const FIXTURES: DamageFixture[] = [
  valentineRhona as DamageFixture,
  noaRhona as DamageFixture,
  noaChimera as DamageFixture,
  // Captures du 18/08/2026 (Sevih) — preuves des procs SKILL_START au
  // lanceur, de la dédup, du facteur total et des taux PREMIUM dans la fiche
  // (défactorisation sheet.ts : le « +60 DEF » des Caren était le terme
  // croisé trust × premiums, résolu le jour même).
  rhonaMeteos as DamageFixture,
  carenMeteos as DamageFixture,
  carenAmadeus as DamageFixture,
];
