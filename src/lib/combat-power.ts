/**
 * Combat Power d'un perso SANS équipement — CalcBattlePower (libil2cpp 1.4.9)
 * avec les termes gear zéroés (talisman ooBp = 0, EE eeBp = 0). Formule
 * validée 0-diff in-game par le gear-solver (5 persos, LB0→3).
 *
 * Conventions d'entrée (IMPORTANT) :
 *  - Les stats sont les valeurs AFFICHÉES : critRate 15 = 15 %, critDmg 150 = 150 %.
 *  - eff / effRes = l'entier affiché tel quel (pas de ×10).
 *  - Sans gear, pen / dmgUp / dmgReduce / critDmgReduce valent presque toujours 0 —
 *    gardés en option car certains passifs intrinsèques peuvent en donner.
 */
export interface NoGearCpInput {
  // Stats no-gear (sortie de la composition de base du perso)
  atk: number;
  def: number;
  hp: number;
  spd: number;
  /** % affiché — cappé à 100 dans la formule. */
  critRate: number;
  /** % affiché. */
  critDmg: number;
  eff: number;
  effRes: number;
  /** % affichés, défaut 0. */
  pen?: number;
  dmgUp?: number;
  dmgReduce?: number;
  critDmgReduce?: number;
  // Constantes du perso
  /** Étoiles affichées (transcend UI star). */
  showUIStar: number;
  /** Le « +N » au-dessus des étoiles. */
  starPlus: number;
  skills: { first: number; second: number; ultimate: number; chainPassive: number };
  /** Core Fusion active. */
  fused: boolean;
}

export function calcNoGearBattlePower(s: NoGearCpInput): number {
  // ── Constantes additives ──────────────────────────────────────────────
  const starBonus = s.showUIStar * 500 + s.starPlus * 120;
  // Chaque skill compte (niveau − 1) × 100 ; un perso tout-Lv1 ajoute 0.
  const skillSum =
    Math.max(0, s.skills.first - 1) +
    Math.max(0, s.skills.second - 1) +
    Math.max(0, s.skills.ultimate - 1) +
    Math.max(0, s.skills.chainPassive - 1);
  const fusionBp = s.fused ? 5000 : 0;
  // Sans équipement : eeBp = 0 (EE) et ooBp = 0 (talisman).

  // ── Cœur stat-dépendant (valeurs « raw » internes = affiché × 10) ─────
  const crcRaw = Math.min(s.critRate * 10, 1000); // CHC cappé à 100 %
  const chdRaw = s.critDmg * 10;
  const penRaw = (s.pen ?? 0) * 10;
  const dmgupRaw = (s.dmgUp ?? 0) * 10;
  const dmgredRaw = (s.dmgReduce ?? 0) * 10;
  const ecdrRaw = (s.critDmgReduce ?? 0) * 10;

  // Facteur crit : linéaire jusqu'à 2000 raw (DMG+ + CHD), puis coude saturant.
  const sumCd = dmgupRaw + chdRaw;
  let critF: number;
  if (sumCd < 2001) {
    critF = sumCd / 1000;
  } else {
    const x = Math.min((sumCd - 2000) / 2500, 1.0);
    critF = 2.0 * (1 - (1 - x) ** 2) + 2.5;
  }

  const crcF = (crcRaw + 1000) / 1000;
  const penF = (penRaw * 1.5 + 1000) / 1000;
  const spdF = 1 + s.spd / 50;
  const effF = (1.7 * s.eff) / (s.eff + 130);
  const hdF = 44000 / (s.hp + s.def + 44000);
  const defF = hdF * 0.15 + 1.05;
  const resR = 1 + (0.25 * s.effRes) / (s.effRes + 200);
  const defR = 1 + (0.25 * (ecdrRaw + dmgredRaw)) / (ecdrRaw + dmgredRaw + 200);

  const chain = (1 + effF) * crcF * critF * penF * spdF;
  const atkPart = 0.125 * s.atk * (1 + chain);
  const defPart = (s.hp + s.def) * defF * defR * resR;

  return Math.floor(atkPart + defPart + starBonus + skillSum * 100 + fusionBp);
}
