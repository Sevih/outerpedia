/**
 * Normalisation du texte cherchable, PARTAGÉE serveur/client : l'index
 * (`search-index.ts`) pré-normalise ses termes côté serveur, la palette
 * (`SearchModal`) normalise la saisie à chaque frappe. Les deux DOIVENT passer
 * par cette fonction — deux normalisations qui divergent d'un cheveu rendent un
 * terme indexé inatteignable, sans rien casser de visible.
 *
 * Fichier volontairement SANS DÉPENDANCE : `search-index.ts` lit le disque
 * (guides, persos) et ne doit jamais entrer dans un bundle client, qui n'en
 * importe donc que des types.
 *
 * NFKD (et pas NFD) : la décomposition de compatibilité replie aussi les formes
 * pleine chasse (« Ａｍｅ » ⊃ « ame ») qu'on croise dans les noms jp/zh.
 */
export function normalizeSearchText(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}
