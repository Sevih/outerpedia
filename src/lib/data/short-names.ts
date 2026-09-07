/**
 * Lecture des NOMS COURTS D'AFFICHAGE curés (`data/curated/short-names.json`).
 *
 * `Record<id, LocalizedText>` : nom abrégé localisé par perso (« D.Stella » pour
 * « Demiurge Stella »…), affiché là où la place manque — références de perso des
 * recos d'équipement, tuiles du tier-list-maker. Inchangé (`name-aliases.json`,
 * keyé `c{id}`, `_name` + en/jp/kr/zh) mais ramené au modèle courant : id direct,
 * 5 langues. Lu au fs à chaque appel (l'admin voit ses écritures aussitôt).
 *
 * NB : DISTINCT des alias de RECHERCHE (cf. `search-aliases`) — ici on AFFICHE,
 * on n'élargit pas la recherche.
 */
import { loadCuratedJson } from '@/lib/data/disk';
import type { LocalizedText } from '@contracts';

/** Charge tous les noms courts (clé = ID). Fichier absent → {} ; JSON cassé → lève. */
export function loadShortNames(): Record<string, LocalizedText> {
  return loadCuratedJson<Record<string, LocalizedText>>('curated/short-names.json', {});
}
