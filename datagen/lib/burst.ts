/**
 * Règle UNIQUE du marqueur « burstable » : un skill dont `RequireAP` est un
 * CSV de PLUSIEURS coûts (burst 1/2/3) au premier coût > 0. Partagée entre le
 * générateur skills (wiki) et l'extracteur damage — les deux artefacts
 * (`skills.json`, `damage/characters.json`) doivent porter le MÊME marqueur :
 * le moteur y rattache les déclinaisons `SKT_BURST_1..3` (slot + niveau) et
 * l'UI y accroche les descs de burst. Garde croisée : damage-data.test.ts.
 */
import { num, splitCsv } from './tables';

/** Coûts d'AP des bursts, ou `undefined` si le skill n'est pas burstable. */
export function burstAPCosts(requireAP: string | undefined | null): number[] | undefined {
  if (num(requireAP) <= 0) return undefined;
  const costs = splitCsv(requireAP).map(num);
  return costs.length > 1 ? costs : undefined;
}
