import type { TFunction } from '@/i18n';

/**
 * DURÉE LOCALISÉE d'un compte à rebours — « 3d 4h 12m », « 3j 4h 12min »,
 * « 3日 4時間 12分 ». Une seule forme pour les quatre sites (bannières, resets
 * serveur, buff du jour, progress tracker) ; `SingularityCountdown` garde son
 * affichage numérique `hh:mm:ss`, choix distinct.
 *
 * Deux voies évaluées (25/09) :
 * - `Intl.NumberFormat` `style: 'unit'`, `unitDisplay: 'narrow'` : rendu court
 *   en en/fr/es/kr/zh (« 3j 4h 12min », « 3일 4시간 12분 », « 3天 4小时 12分钟 »),
 *   mais le CLDR donne en japonais `narrow` = « 3d 4h 12m » — l'anglais qu'on
 *   cherche à quitter — et `short` = « 3 日 4 時間 12 分 », espacé et long. Le
 *   rendu dépend de plus de la version ICU du moteur (Node des tests, navigateur
 *   du visiteur) : ni stable, ni maîtrisable.
 * - Clés i18n `duration.day/hour/minute/second` (gabarits `{n}…`) : RETENUE.
 *   Rendu court et choisi langue par langue (« 3日 4時間 12分 », « 3天 4小时 12分 »),
 *   identique partout, testable. Le prix : les libellés viennent du serveur
 *   (`durationUnits(t)`, passé en prop), les locales n'étant pas dans le bundle
 *   client — d'où `units` à la place d'un `lang`.
 */

/** Gabarits d'unité (`{n}` = la valeur), résolus côté serveur. */
export interface DurationUnits {
  day: string;
  hour: string;
  minute: string;
  second: string;
}

export interface FormatDurationOptions {
  /** Descend jusqu'aux secondes (compteurs qui battent la seconde). */
  seconds?: boolean;
  /** Nombre d'unités affichées, à partir de la plus grande non nulle. Défaut 3. */
  maxUnits?: number;
}

/** Les gabarits d'unité d'une langue, à passer aux composants client. */
export function durationUnits(t: TFunction): DurationUnits {
  return {
    day: t('duration.day'),
    hour: t('duration.hour'),
    minute: t('duration.minute'),
    second: t('duration.second'),
  };
}

const STEPS = [
  { unit: 'day', ms: 86_400_000 },
  { unit: 'hour', ms: 3_600_000 },
  { unit: 'minute', ms: 60_000 },
  { unit: 'second', ms: 1000 },
] as const;

/**
 * Durée `ms` en unités consécutives, de la plus grande non nulle à la plus
 * petite permise (`1d 0h 5m` garde son zéro central). Chaque unité est TRONQUÉE,
 * jamais arrondie : un compte à rebours n'annonce pas une minute qui n'y est
 * plus. Durée nulle ou négative : `0` de la plus petite unité.
 */
export function formatDuration(
  ms: number,
  units: DurationUnits,
  { seconds = false, maxUnits = 3 }: FormatDurationOptions = {},
): string {
  const steps = seconds ? STEPS : STEPS.slice(0, 3);
  let rest = Math.max(0, ms);
  const values = steps.map(({ ms: size }) => {
    const n = Math.floor(rest / size);
    rest -= n * size;
    return n;
  });
  const first = values.findIndex((n) => n > 0);
  const start = first === -1 ? steps.length - 1 : first;
  return steps
    .slice(start, start + maxUnits)
    .map(({ unit }, i) => units[unit].replace('{n}', String(values[start + i])))
    .join(' ');
}
