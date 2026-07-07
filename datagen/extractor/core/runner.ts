/**
 * RUNNER générique — exécute n'importe quelle `ExtractorSpec`.
 *
 * Pipeline pur, sans I/O disque ni HTTP (sauf lecture de l'oracle pour le diff,
 * qui est en lecture seule) :
 *   select() → prepare() → map() par ligne → validate() → finalize() → complétude
 *
 * Le runner ne connaît aucune entité en dur : c'est la spec qui porte le savoir.
 */
import { checkCompleteness, type CompletenessReport } from './diff';
import type { ExtractorSpec } from './spec';
import { validate, type Issue } from './validate';

export interface ExtractResult<TOut> {
  id: string;
  /** Entités extraites, indexées par clé. */
  items: Record<string, TOut>;
  /** Sorties transverses (glossaires…) si la spec en produit. */
  extra?: Record<string, unknown>;
  /** Écarts de schéma (chemin préfixé par la clé d'entité). Vide = conforme. */
  issues: Issue[];
  /** Rapport de complétude vs oracle, si la spec déclare une couverture. */
  completeness?: CompletenessReport;
}

export function runSpec<TOut, TAux>(spec: ExtractorSpec<TOut, TAux>): ExtractResult<TOut> {
  const rows = spec.select();
  const aux = spec.prepare(rows);

  const items: Record<string, TOut> = {};
  const issues: Issue[] = [];

  for (const row of rows) {
    const out = spec.map(row, aux);
    const key = spec.key(out);
    // Préfixe le chemin par la clé d'entité pour des écarts traçables.
    for (const iss of validate(out, spec.schema, `${spec.id}[${key}]`)) issues.push(iss);
    items[key] = out;
  }

  const result: ExtractResult<TOut> = { id: spec.id, items, issues };

  if (spec.finalize) result.extra = spec.finalize(Object.values(items), aux);
  if (spec.coverage) result.completeness = checkCompleteness(Object.keys(items), spec.coverage);

  return result;
}
