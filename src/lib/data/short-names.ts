/**
 * Lecture des NOMS COURTS D'AFFICHAGE curés (`data/curated/short-names.json`).
 *
 * `Record<id, LocalizedText>` : nom abrégé localisé par perso (« D.Stella » pour
 * « Demiurge Stella »…), affiché là où la place manque — références de perso des
 * recos d'équipement, tuiles du tier-list-maker. Inchangé (`name-aliases.json`,
 * keyé `c{id}`, `_name` + en/jp/kr/zh) mais ramené au modèle courant : id direct,
 * les langues du site. Lu au fs à chaque appel (l'admin voit ses écritures aussitôt).
 *
 * Le nom court est l'ABRÉVIATION ANGLAISE pour toutes les langues (décision
 * Sevih 2026-09-23, quand le jeu a livré le français et l'espagnol) : « S.Regina »
 * sous « Farceur de la Piscine Regina » comme sous « Pool Party Prankster Regina ».
 * C'était déjà le cas pour jp/kr/zh — les entrées ne portent qu'`en`, `lRec`
 * replie dessus. Une entrée n'a besoin d'exister que si le nom complet ne tient
 * pas sous la carte dans AU MOINS une langue (`card-label.test.ts` le vérifie
 * pour les six).

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
