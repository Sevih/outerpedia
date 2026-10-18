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
  // Le client calcule en FLOAT32 (`CFormula.CalcBattlePower`) : chaque
  // opération est portée telle quelle, dans son ordre, sous `Math.fround` —
  // en double, 1 490 tirages sur 200 000 sortaient à ±1 (revue du 09/10).
  const f = Math.fround;

  // ── Valeurs « raw » internes (affiché × 10), entières côté client ──────
  const crcRaw = Math.min(s.critRate * 10, 1000); // CHC cappé à 100 %
  const chdRaw = s.critDmg * 10;
  const penRaw = (s.pen ?? 0) * 10;
  const dmgupRaw = (s.dmgUp ?? 0) * 10;
  const dmgredRaw = (s.dmgReduce ?? 0) * 10;
  const ecdrRaw = (s.critDmgReduce ?? 0) * 10;

  // Facteur crit : linéaire jusqu'à 2000 raw (DMG+ + CHD), puis coude saturant
  // (`Mathf.Pow` = `Math.pow` rendu en float).
  const sumCd = f(chdRaw + dmgupRaw);
  const critF =
    sumCd < 2001
      ? f(sumCd / 1000)
      : f(2.5 + f(2 * f(1 - f(Math.pow(f(1 - Math.min(1, f(f(sumCd - 2000) / 2500))), 2)))));

  // Part ATK : (atk + atk × CHC × crit × PEN × SPD × EFF) / 8.
  const crcF = f(f(1000 + crcRaw) * f(0.001));
  const penF = f(f(1000 + f(penRaw * 1.5)) * f(0.001));
  const spdF = f(1 + f(s.spd / 50));
  const effF = f(1 + f(f(1.7) * f(s.eff / f(s.eff + 130))));
  let chain = f(s.atk * crcF);
  chain = f(chain * critF);
  chain = f(chain * penF);
  chain = f(chain * spdF);
  chain = f(chain * effF);
  const atkPart = f(f(s.atk + chain) / 8);

  // Part PV + DEF : × DEF, × réductions, × RES.
  const hd = f(s.hp + s.def);
  const red = f(ecdrRaw + dmgredRaw);
  let defPart = f(hd * f(f(1.05) + f(f(0.15) * f(44000 / f(hd + 44000)))));
  defPart = f(defPart * f(1 + f(f(0.25) * f(red / f(red + 200)))));
  defPart = f(defPart * f(1 + f(f(0.25) * f(s.effRes / f(s.effRes + 200)))));

  // ── Constantes additives : étoiles, puis (Σ niveaux − 4) × 100 — un perso
  // tout-Lv1 ajoute 0. Sans équipement : EE (num10) et talisman (num11) = 0.
  const skillSum = s.skills.first + s.skills.second + s.skills.ultimate + s.skills.chainPassive;
  const constants = f(f(f(s.showUIStar * 500) + f(s.starPlus * 120)) + f(f(skillSum - 4) * 100));
  const fusionBp = s.fused ? 5000 : 0;

  return Math.floor(f(f(f(f(f(atkPart + defPart) + constants) + 0) + 0) + fusionBp));
}
