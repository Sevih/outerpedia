/**
 * Contrat d'un EXTRACTEUR (le cœur du moteur neuf).
 *
 * Une `ExtractorSpec` décrit DE FAÇON DÉCLARATIVE comment produire une entité :
 * quelles lignes, comment les mapper, quel schéma de sortie. Tout le savoir de
 * mapping d'une entité vit dans UN fichier spec.
 *
 * Le moteur (`runner`) est générique : il ne connaît aucune entité en dur.
 * Ajouter une entité = écrire une spec, jamais copier-coller une route.
 * → répond aux défauts « logique dupliquée par entité » et « tout dans les routes ».
 */
import type { Row } from '../../lib/tables';
import type { Schema } from './validate';

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
}
