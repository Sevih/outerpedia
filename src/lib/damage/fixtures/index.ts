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
import francescaS2b2 from './francesca-s2-burst2.json';
import francescaDotBleed from './francesca-dot-bleed.json';
import francescaErisAllyS2 from './francesca-eris-ally-s2.json';
import francescaErisAllyS1 from './francesca-eris-ally-s1-stack.json';
import francescaErisTalDmg from './francesca-eris-tal-dmg.json';
import francescaTalDmgNoncumul from './francesca-tal-dmg-noncumul.json';
import gnosisbethArsnova from './gnosisbeth-arsnova.json';
import gnosisbethScrapmetal from './gnosisbeth-scrapmetal.json';
import gnosisbethScrapmetalNoEE from './gnosisbeth-scrapmetal-noee.json';
import gnosisbethScrapmetalEffbuff from './gnosisbeth-scrapmetal-effbuff.json';

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
  // Burst 2 du S2 (22/08/2026, capturé APRÈS le câblage par clip) — témoin
  // structurel § 8.1 : le burst joue le clip unique Skill_2_Upgrade (une
  // cascade de 1000 ‰) là où le S2 de base fait cascade(700) + cascade(300).
  francescaS2b2 as DamageFixture,
  // Premier tick de DoT mesuré in-game (22/08/2026) — valide CalcDamageDOT
  // (§ 11) de bout en bout : le Bleed de Francesca sur Ars Nova.
  francescaDotBleed as DamageFixture,
  // Buffs d'ALLIÉS (23/08/2026) — Eris déclarée alliée de Francesca : les
  // premiums d'équipe (EE + skill_8) tombent par le canal buff (S2 exact),
  // et 1 S2 d'Eris = 1 stack déclaré du +20 % Strikers (S1 exact) — la
  // sémantique MY_TEAM_ATTACKER = classe, la valeur additive § 9.1 et le
  // pas-de-défactorisation des premiums d'alliés sont prouvés d'un coup.
  francescaErisAllyS2 as DamageFixture,
  francescaErisAllyS1 as DamageFixture,
  // Talismans d'ÉQUIPE (24/08/2026) — la main DMG d'Eris alliée atteint
  // Francesca par le canal buff (S1 exact, fiche à dmg_boost 0 → combat
  // 120 ‰), et deux alliés portant la MÊME main ne se cumulent PAS (seule
  // la plus forte compte — un cumul aurait calculé trop haut).
  francescaErisTalDmg as DamageFixture,
  francescaTalDmgNoncumul as DamageFixture,
  // Gnosis Beth (24/08/2026, Beth nue sauf EE, seule, avant le 1er tour du
  // boss) — CINQ zéros qui verrouillent trois mécaniques : le tick custom
  // d'Eternal Bleeding (Effectiveness × 700 %, flat) est boosté par les
  // ENHANCE posés sur la cible (trans_8 +50 % dès la transcendance 4★, EE
  // +50 % contre les boss — la capture SANS EE à × 1,5 discrimine : sans
  // elle, « 2 poses × 1,0 » et « 1 pose × 2,0 » sont indiscernables) ; les
  // poses multiples d'un même skill ne cumulent JAMAIS le tick ; et les
  // passifs de BOSS à condition TARGET_ELEMENT (Ars Nova : +300 EQUAL − 450
  // « attaquant lumière » = net −150 § 9.2 — le témoin Scrap Metal, boss
  // terre sans ces lignes, est exact sans elles).
  gnosisbethArsnova as DamageFixture,
  gnosisbethScrapmetal as DamageFixture,
  gnosisbethScrapmetalNoEE as DamageFixture,
  // L'expérience LIVE (24/08/2026) : Sterope buffe +100 % EFF ENTRE la pose
  // et le tick suivant → 1995 → 3990. Prouve que la stat du tick est lue EN
  // DIRECT (pas capturée à la pose) ET que le buff multiplie la fiche
  // COMPLÈTE, main de talisman incluse (stat d'ITEM, pas un premium
  // défactorisé — 190 × 2 = 380 tout rond).
  gnosisbethScrapmetalEffbuff as DamageFixture,
];
