/**
 * Règle UNIQUE du marqueur « burstable », celle du client : un skill est une
 * entrée de burst dès que sa liste de coûts `RequireAP` (CSV, burst 1/2/3)
 * est NON VIDE, quel que soit le nombre de coûts ou leur valeur —
 * `CSkill.cs:75`, `IsBurstEntryType => 0 < RequireAPList.Count`, la liste
 * remplie par `CSplitter.Split` (`CSkillTemplet.cs:159`, chaîne vide → liste
 * vide). Un skill à UN seul coût est donc burstable. Partagée entre le
 * générateur skills (wiki) et l'extracteur damage — les deux artefacts
 * (`skills.json`, `damage/characters.json`) doivent porter le MÊME marqueur :
 * le moteur y rattache les déclinaisons `SKT_BURST_1..3` (slot + niveau) et
 * l'UI y accroche les descs de burst. Garde croisée : damage-data.test.ts.
 */
import { num, splitCsv } from './tables';

/** Coûts d'AP des bursts, ou `undefined` si le skill n'est pas burstable. */
export function burstAPCosts(requireAP: string | undefined | null): number[] | undefined {
  const costs = splitCsv(requireAP).map(num);
  return costs.length > 0 ? costs : undefined;
}
