/**
 * AMONT du moteur — reconstruction des stats de COMBAT depuis la fiche SAISIE.
 * Réf : docs/specs/damage-formula.md § 16.1 (identité consolidée 27/07/2026).
 *
 * La fiche affichée en jeu (celle que l'utilisateur SAISIT dans le calculateur)
 * est le pipeline § 16 SANS le canal des buffs : elle contient déjà base,
 * évolution, éveil, monad, transcendance, items ET le terme Codex/archive
 * (`div1000(base × archiveRate)`, ajouté HORS multiplicateur de buffs).
 * L'affinité (Trust) est le cas inverse : ABSENTE de la fiche, à porter par le
 * canal `buffValue` (buffs passifs plats).
 *
 * Identité EXACTE (les troncatures s'annulent car fiche = sub_sans_buffs + A,
 * prouvée par test de propriété contre `calcFinalStat`) :
 *
 *   A      = div1000(base × archiveRate)
 *   combat = div1000((fiche − A + buffVal) × (1000 + buffRate)) + A
 *
 * L'amont n'a donc besoin que de : la fiche saisie, la stat de BASE recalculée
 * (`calcBaseStat` § 3.1-3.2 — exige min/max du templet et le NIVEAU), le taux
 * de Codex de la stat, et les agrégats du canal buff (affinité + buffs de
 * scénario + passifs d'équipement § 15).
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
  const sub = BigInt(input.sheetValue) - a + BigInt(input.buffValue);
  trace?.push({
    ref: '§ 16.1',
    label: 'fiche − archive + buffs plats',
    in: { sheetValue: input.sheetValue, buffValue: input.buffValue },
    out: Number(sub),
  });
  const total = div1000(sub * BigInt(1000 + input.buffValueRate)) + a;
  const combat = total < 0n ? 0 : Number(total);
  trace?.push({
    ref: '§ 16.1',
    label: 'multiplicateur des buffs (‰) + archive (clamp ≥ 0)',
    in: { buffValueRate: input.buffValueRate },
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
