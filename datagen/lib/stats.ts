/**
 * Primitive #3 (amorce) — décodage des valeurs de stat.
 *
 * Les valeurs de stat du jeu se lisent selon leur `ApplyingType` :
 *   - OAT_RATE : per-mille (×10) → pourcentage (300 → 30%)
 *   - OAT_ADD  : valeur plate (entier)
 *
 * (L'échelle OAT_RATE = /10 est confirmée par la logique éprouvée de la V2.)
 */

/** Formate une valeur de stat selon son type d'application. */
export function formatStatValue(applyingType: string, value: number): string {
  return applyingType === 'OAT_RATE' ? `${value / 10}%` : String(value);
}
