/**
 * Contrat d'un EXTRACTEUR (le cœur du moteur neuf).
 *
 * Une `ExtractorSpec` décrit DE FAÇON DÉCLARATIVE comment produire une entité :
 * quelles lignes, comment les mapper, quel schéma de sortie, quel oracle de
 * complétude. Tout le savoir de mapping d'une entité vit dans UN fichier spec.
 *
 * Le moteur (`runner`) est générique : il ne connaît aucune entité en dur.
 * Ajouter une entité = écrire une spec, jamais copier-coller une route.
 * → répond aux défauts « logique dupliquée par entité » et « tout dans les routes ».
 */
import type { Row } from '../../lib/tables';
import type { Schema } from './validate';

/**
 * Statut d'un champ legacy vis-à-vis de notre extraction :
 *   - `extracted` : on le produit (donnée de jeu mappée) ;
 *   - `curated`   : connaissance humaine → ira dans `data/curated`, pas extraite ;
 *   - `todo`      : donnée de jeu qu'on DEVRAIT extraire mais pas encore ;
 *   - `ignore`    : dérivé/non pertinent (recalculable, ou bruit V2).
 * Un champ legacy non listé → `unknown` (signalé fort).
 */
export type FieldStatus = 'extracted' | 'curated' | 'todo' | 'ignore';

/** Oracle de complétude : confronte la sortie au snapshot `data/legacy`. */
export interface CoverageSpec {
  /** Dossier des fichiers oracle, ex. `data/legacy/character`. */
  dir: string;
  /** Clé d'un objet legacy (défaut : champ `ID`). */
  keyOf?: (legacy: Record<string, unknown>) => string;
  /** Statut déclaré de chaque champ legacy connu. */
  fields: Record<string, FieldStatus>;
}

/**
 * Spec d'extraction d'une entité `TOut`, avec un contexte partagé `TAux`
 * (lookups + glossaires) pré-calculé une fois pour tout le lot.
 */
export interface ExtractorSpec<TOut, TAux = unknown> {
  /** Identifiant CLI/route : `character`, `weapon`… */
  id: string;
  /** Lignes sources (filtrage de l'entité inclus). */
  select(): Row[];
  /** Pré-calcul partagé et PUR (réverses, glossaires en cours…). */
  prepare(rows: Row[]): TAux;
  /** Mapping PUR d'une ligne vers l'entité de sortie. */
  map(row: Row, aux: TAux): TOut;
  /** Clé unique d'une sortie (indexation + diff). */
  key(out: TOut): string;
  /** Schéma runtime vérifié pour chaque sortie. */
  schema: Schema;
  /** Sorties transverses dérivées (glossaires…), si l'entité en produit. */
  finalize?(items: TOut[], aux: TAux): Record<string, unknown>;
  /** Oracle de complétude (optionnel). */
  coverage?: CoverageSpec;
}
