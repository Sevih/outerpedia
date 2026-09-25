/** Accès aux PALIERS de classement d'éther (`data/generated/ether-rankings.json`, guide Ether Income). */
import type { EtherRankingsData } from '@contracts';
import rankingsData from '@data/generated/ether-rankings.json';

const RANKINGS = rankingsData as unknown as EtherRankingsData;

export function getEtherRankings(): EtherRankingsData {
  return RANKINGS;
}
