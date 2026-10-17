/**
 * Arithmétique du calculateur d'Ether, pure (testée sans rendu) : totaux
 * quotidiens/hebdo/mensuels et projection jusqu'à une date. Sans import : le
 * calculateur est un composant client, rien d'ici ne doit tirer de données.
 *
 * Un mois vaut 30 jours PARTOUT (décision de Sevih, 15/10/2026) : le quotidien
 * comme l'hebdo passent au mois par × 30 / 7 — l'hebdo comptait 4 semaines
 * (28 jours), soit 2/7 d'un `weeklySpike` de moins par mois.
 */

/** Ce que l'arithmétique lit d'une ligne (sous-ensemble de `SourceRow`). */
export interface EtherRow {
  /** Jours actifs par semaine (daily seulement, défaut 7). */
  daysPerWeek?: number;
  /** Cadence en mois (monthly seulement, défaut 1). */
  monthsPerCycle?: number;
}

export interface EtherTotals {
  dailyBase: number;
  weeklyFromDaily: number;
  weeklySpike: number;
  monthlySpike: number;
  weeklyTotal: number;
  monthlyTotal: number;
}

export interface EtherProjection {
  days: number;
  weeks: number;
  months: number;
  fromDaily: number;
  fromWeekly: number;
  fromMonthly: number;
  total: number;
}

const DAY_MS = 86_400_000;

/** Un montant hebdomadaire ramené au mois de 30 jours (arrondi). */
export function monthlyFromWeekly(weekly: number): number {
  return Math.round((weekly * 30) / 7);
}

/** Contribution MENSUELLE (moyenne si la source n'a pas lieu chaque mois). */
export function monthlyOf(row: EtherRow, amount: number): number {
  return Math.round(amount / (row.monthsPerCycle ?? 1));
}

export function etherTotals<R extends EtherRow>(
  rows: { daily: R[]; weekly: R[]; monthly: R[] },
  amountOf: (row: R) => number,
): EtherTotals {
  const dailyBase = rows.daily.reduce((acc, s) => acc + amountOf(s), 0);
  const weeklyFromDaily = rows.daily.reduce(
    (acc, s) => acc + amountOf(s) * (s.daysPerWeek ?? 7),
    0,
  );
  const weeklySpike = rows.weekly.reduce((acc, s) => acc + amountOf(s), 0);
  const monthlySpike = rows.monthly.reduce((acc, s) => acc + monthlyOf(s, amountOf(s)), 0);
  return {
    dailyBase,
    weeklyFromDaily,
    weeklySpike,
    monthlySpike,
    weeklyTotal: weeklyFromDaily + weeklySpike,
    monthlyTotal:
      monthlyFromWeekly(weeklyFromDaily) + monthlyFromWeekly(weeklySpike) + monthlySpike,
  };
}

/**
 * Projection de `now` jusqu'au jour `target` (AAAA-MM-JJ) inclus, en jours UTC :
 * le jeu bascule à 00:00 UTC (cf. `utcDay`, `src/lib/data/singularity.ts`). Le
 * jour en cours compte ; une date passée donne 0 jour.
 */
export function etherProjection(
  totals: EtherTotals,
  target: string,
  stock: number,
  now: number,
): EtherProjection {
  const end = Date.parse(`${target}T23:59:59Z`);
  const days = Math.max(0, Math.floor((end - now) / DAY_MS) + 1);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const fromDaily = Math.round((totals.weeklyFromDaily * days) / 7);
  const fromWeekly = totals.weeklySpike * weeks;
  const fromMonthly = totals.monthlySpike * months;
  return {
    days,
    weeks,
    months,
    fromDaily,
    fromWeekly,
    fromMonthly,
    total: stock + fromDaily + fromWeekly + fromMonthly,
  };
}
