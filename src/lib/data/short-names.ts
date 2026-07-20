/**
 * Lecture des NOMS COURTS D'AFFICHAGE curés (`data/curated/short-names.json`).
 *
 * `Record<id, LocalizedText>` : nom abrégé localisé par perso (« D.Stella » pour
 * « Demiurge Stella »…), affiché là où la place manque — références de perso des
 * recos d'équipement, tuiles du tier-list-maker. Parité V2 (`name-aliases.json`,
 * keyé `c{id}`, `_name` + en/jp/kr/zh) mais ramené au modèle V3 : id direct,
 * 5 langues. Lu au fs à chaque appel (l'admin voit ses écritures aussitôt).
 *
 * NB : DISTINCT des alias de RECHERCHE (cf. `search-aliases`) — ici on AFFICHE,
 * on n'élargit pas la recherche.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { LocalizedText } from '@contracts';

const PATH = resolve(process.cwd(), 'data/curated/short-names.json');

/** Charge tous les noms courts (clé = ID). Fichier absent/illisible → {}. */
export function loadShortNames(): Record<string, LocalizedText> {
  try {
    return JSON.parse(readFileSync(PATH, 'utf8')) as Record<string, LocalizedText>;
  } catch {
    return {};
  }
}
