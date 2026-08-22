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
import erisMeteosS2 from './eris-meteos-s2.json';
import erisMeteosS3 from './eris-meteos-s3.json';
import hdianneMeteos from './hdianne-meteos.json';
import hdianneS3crit from './hdianne-meteos-s3-crit.json';
import hdianneS3 from './hdianne-meteos-s3.json';
import francescaS3 from './francesca-s3.json';
import francescaS2crit from './francesca-s2-crit.json';
import francescaS2 from './francesca-s2.json';

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
  // Captures du 19/08/2026 (Sevih) — compteurs § 9.1 : débuffs de la cible
  // validés à dd=1 (S2) et dd=3 (S3) chez Eris ; scaling vitesse du burst de
  // H. Dianne (le S2b1 ne lit PAS le compteur de buffs d'équipe).
  erisMeteosS2 as DamageFixture,
  erisMeteosS3 as DamageFixture,
  hdianneMeteos as DamageFixture,
  // S3 de H. Dianne SEULE (recapturés proprement avec ot=2 déclaré,
  // 19/08/2026) — le compteur de buffs d'équipe se lit AU MOMENT du hit
  // (les poses du S3 lui-même ne comptent pas), inclut le LANCEUR et les
  // buffs sans effet sur le montant du hit.
  hdianneS3crit as DamageFixture,
  hdianneS3 as DamageFixture,
  // Francesca (22/08/2026) — condition d'état TARGET_HAS_BUFF déclarée
  // (coche 2000015_3 : S3 exact AVEC, faux SANS) et étanchéité des callers
  // (la coche du S3 ne fuit pas sur le S2).
  francescaS3 as DamageFixture,
  francescaS2crit as DamageFixture,
  francescaS2 as DamageFixture,
];
