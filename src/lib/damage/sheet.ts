/**
 * AMONT du moteur — reconstruction des stats de COMBAT depuis la fiche SAISIE.
 * Réf : docs/specs/damage-formula.md § 16.1 (identité consolidée 27/07/2026).
 *
 * La fiche affichée en jeu (celle que l'utilisateur SAISIT dans le calculateur)
 * est le pipeline § 16 sans les buffs de COMBAT : elle contient déjà base,
 * évolution, éveil, monad, transcendance, items, le terme Codex/archive
 * (`div1000(base × archiveRate)`, ajouté HORS multiplicateur de buffs) — ET
 * les buffs PREMIUM (`BT_STAT_PREMIUM` passifs inconditionnels : passif de
 * transcendance skill_8, EE Lv10, quirks IOT_BUFF, artefacts), qui occupent le
 * canal `buffRate`/`buffVal` de CalcFinalStat en VILLE comme en combat.
 * L'affinité (Trust) est le cas inverse : ABSENTE de la fiche, à porter par le
 * canal `buffValue` (buffs passifs plats).
 *
 * Identité (fiche = div1000(sub × (1000 + Rp)) + A, avec Rp = Σ taux premium) :
 *
 *   A      = div1000(base × archiveRate)
 *   sub    = ceil((fiche − A) × 1000 / (1000 + Rp))       // défactorisation
 *   combat = div1000((sub + buffVal) × (1000 + Rp + buffRate)) + A
 *
 * Rp = 0 (aucun premium sur la stat) redonne l'identité historique EXACTE
 * (prouvée par test de propriété contre `calcFinalStat`). Rp > 0 : le jeu
 * garde `sub` en mémoire, nous le reconstruisons — la troncature de la fiche
 * laisse une ambiguïté de ±1 sur `sub` (±2 sur la stat de combat, sous la
 * tolérance des fixtures) ; `ceil` prend le plus petit antécédent exact.
 * PREUVE in-game (Caren 18/08/2026) : fiche nue 2314 (+732) reproduite à
 * l'unité avec Rp=100 (skill_8), fiche équipée 5631 → sub 4291 avec
 * Rp=300 (skill_8 100 + EE Lv10 200), DEF de combat 5891 EXACTE une fois le
 * trust (+200 plats) multiplié par (1000+Rp) — le « +60 » des 6 captures est
 * le terme croisé trust × premiums, pas un buff manquant.
 *
 * L'amont a donc besoin de : la fiche saisie, la stat de BASE recalculée
 * (`calcBaseStat` § 3.1-3.2 — exige min/max du templet et le NIVEAU), le taux
 * de Codex de la stat, le taux PREMIUM cumulé de la stat (collecté par les
 * résolveurs kit/équipement/quirks), et les agrégats du canal buff (affinité +
 * buffs de scénario + passifs d'équipement § 15).
 */

import { calcBaseStat } from './formula';
import type { TraceStep } from './harness';

const div1000 = (x: bigint): bigint => x / 1000n;

/** Terme Codex/archive d'une stat : `div1000(base × archiveRate)` (‰). */
export function archiveTerm(baseValue: number, archiveRatePermille: number): number {
  return Number(div1000(BigInt(baseValue) * BigInt(archiveRatePermille)));
}

export interface SheetToCombatInput {
  /** Stat de la fiche du jeu, saisie telle quelle. */
  sheetValue: number;
  /**
   * Stat de BASE au niveau courant (`calcBaseStat`, spec § 3.1-3.2) — ne sert
   * qu'au terme Codex ; 0 si la stat n'est pas couverte par le Codex
   * (seuls ATK/DEF/HP le sont).
   */
  baseValue: number;
  /** Taux de Codex de CETTE stat au palier du compte (‰) — 0 hors ATK/DEF/HP. */
  archiveRatePermille: number;
  /** Plats du canal buff : affinité (§ 16.1) + buffs plats du scénario + § 15. */
  buffValue: number;
  /** Taux du canal buff (‰) : buffs % du scénario + passifs § 15 en OAT_RATE. */
  buffValueRate: number;
  /**
   * Taux PREMIUM cumulé de la stat (‰) — `BT_STAT_PREMIUM` passifs
   * inconditionnels du porteur (skill_8, EE, quirks IOT_BUFF, artefacts),
   * DÉJÀ comptés dans la fiche saisie : sert à la défactoriser puis à
   * multiplier les plats du canal buff (terme croisé prouvé 18/08/2026).
   * Absent = 0 (identité historique exacte).
   */
  premiumRatePermille?: number;
}

/**
 * Fiche saisie → stat de combat (identité § 16.1, arithmétique du binaire).
 * `trace` (harnais § 2) : coût nul quand absent.
 */
export function sheetToCombatStat(input: SheetToCombatInput, trace?: TraceStep[]): number {
  const a = BigInt(archiveTerm(input.baseValue, input.archiveRatePermille));
  trace?.push({
    ref: '§ 16.1',
    label: 'terme Codex/archive (base × taux ÷1000)',
    in: { baseValue: input.baseValue, archiveRatePermille: input.archiveRatePermille },
    out: Number(a),
  });
  const rp = BigInt(input.premiumRatePermille ?? 0);
  // Défactorisation de la fiche par les taux premium : le plus petit `sub`
  // dont div1000(sub × (1000+Rp)) redonne fiche − A. Rp = 0 → sub = fiche − A
  // (identité historique, exacte).
  const part = BigInt(input.sheetValue) - a;
  const factored = rp > 0n ? (part * 1000n + (1000n + rp) - 1n) / (1000n + rp) : part;
  if (rp > 0n)
    trace?.push({
      ref: '§ 16.1',
      label: 'défactorisation des premiums de la fiche (‰)',
      in: { premiumRatePermille: Number(rp), part: Number(part) },
      out: Number(factored),
    });
  const sub = factored + BigInt(input.buffValue);
  trace?.push({
    ref: '§ 16.1',
    label: 'fiche défactorisée − archive + buffs plats',
    in: { sheetValue: input.sheetValue, buffValue: input.buffValue },
    out: Number(sub),
  });
  const total = div1000(sub * (1000n + rp + BigInt(input.buffValueRate))) + a;
  const combat = total < 0n ? 0 : Number(total);
  trace?.push({
    ref: '§ 16.1',
    label: 'multiplicateur des buffs (premiums + scénario, ‰) + archive (clamp ≥ 0)',
    in: { buffValueRate: input.buffValueRate, premiumRatePermille: Number(rp) },
    out: combat,
  });
  return combat;
}

/**
 * Confort de l'amont : reconstruit la stat de base puis applique l'identité.
 * `minValue`/`maxValue` viennent de `data/generated/damage/characters.json`
 * (paires brutes du templet) ; `modifierAfter100` de `growth.json` (paliers
 * post-100, ‰) — 0 sous le niveau 101.
 */
export function sheetToCombatStatAtLevel(
  input: Omit<SheetToCombatInput, 'baseValue'> & {
    minValue: number;
    maxValue: number;
    level: number;
    modifierAfter100?: number;
  },
): number {
  const baseValue = calcBaseStat(
    input.minValue,
    input.maxValue,
    input.level,
    input.modifierAfter100 ?? 0,
  );
  return sheetToCombatStat({ ...input, baseValue });
}
