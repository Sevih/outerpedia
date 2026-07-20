/**
 * Lecture des ALIAS DE RECHERCHE curés (`data/curated/search-aliases.json`).
 *
 * `Record<id, string[]>` : termes de recherche supplémentaires par perso (fautes
 * courantes, abréviations, anciens noms…). Lus au système de fichiers à chaque
 * appel (comme la couche curée) pour que l'admin voie ses écritures aussitôt.
 * Alimente `characterSearchNames` — donc le champ recherche des browsers de perso.
 *
 * NB : DISTINCT du nom court d'AFFICHAGE (cf. `short-names`, parité V2
 * `name-aliases.json`). Ici on n'affiche rien : on élargit seulement la recherche.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PATH = resolve(process.cwd(), 'data/curated/search-aliases.json');

/** Charge tous les alias de recherche (clé = ID). Fichier absent/illisible → {}. */
export function loadSearchAliases(): Record<string, string[]> {
  try {
    return JSON.parse(readFileSync(PATH, 'utf8')) as Record<string, string[]>;
  } catch {
    return {};
  }
}
