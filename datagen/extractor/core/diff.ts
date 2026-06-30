/**
 * Diff de COMPLÉTUDE — « qu'est-ce qu'on a zappé vs V2 ? »
 *
 * Confronte les entités extraites au snapshot `data/legacy` (l'oracle) sur deux
 * axes :
 *   1. CHAMPS  — chaque champ présent dans l'oracle est-il pris en compte ?
 *      (classé extracted/curated/todo/ignore ; non déclaré = `unknown`, alerte).
 *   2. ENTITÉS — chaque entité de l'oracle a-t-elle une sortie ? et inversement ?
 *
 * Lecture seule sur `data/legacy` (on ne le modifie jamais : c'est un constat).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import type { CoverageSpec, FieldStatus } from './spec';

export interface FieldReport {
  status: FieldStatus | 'unknown';
  /** Nombre d'objets oracle où le champ est présent (non vide). */
  seen: number;
}

export interface CompletenessReport {
  /** Champs oracle → statut + fréquence, triés (unknown/todo d'abord). */
  fields: Array<{ field: string } & FieldReport>;
  /** Clés présentes dans l'oracle mais absentes de la sortie. */
  missingEntities: string[];
  /** Clés présentes en sortie mais absentes de l'oracle (entités nouvelles). */
  extraEntities: string[];
  oracleCount: number;
  outputCount: number;
}

/** Charge les objets oracle (un fichier JSON par entité) → Map clé → objet. */
function loadOracle(cov: CoverageSpec): Map<string, Record<string, unknown>> {
  const dir = resolve(cov.dir);
  const keyOf = cov.keyOf ?? ((o) => String(o.ID));
  const out = new Map<string, Record<string, unknown>>();
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.json')) continue;
    const obj = JSON.parse(readFileSync(resolve(dir, file), 'utf8')) as Record<string, unknown>;
    out.set(keyOf(obj), obj);
  }
  return out;
}

/** Un champ est « vu » s'il est présent et non vide ([]/{}/'' ne comptent pas). */
function isPresent(v: unknown): boolean {
  if (v === undefined || v === null || v === '') return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v as object).length > 0;
  return true;
}

const STATUS_ORDER: Record<FieldReport['status'], number> = {
  unknown: 0,
  todo: 1,
  extracted: 2,
  curated: 3,
  ignore: 4,
};

export function checkCompleteness(outputKeys: string[], cov: CoverageSpec): CompletenessReport {
  const oracle = loadOracle(cov);

  // 1) Champs : union des clés vues dans l'oracle, classées par statut déclaré.
  const seen = new Map<string, number>();
  for (const obj of oracle.values()) {
    for (const [k, v] of Object.entries(obj)) {
      if (isPresent(v)) seen.set(k, (seen.get(k) ?? 0) + 1);
    }
  }
  const fields = [...seen.entries()]
    .map(([field, count]) => ({
      field,
      status: (cov.fields[field] ?? 'unknown') as FieldReport['status'],
      seen: count,
    }))
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || b.seen - a.seen);

  // 2) Entités : présence croisée oracle ↔ sortie.
  const outSet = new Set(outputKeys);
  const missingEntities = [...oracle.keys()].filter((k) => !outSet.has(k)).sort();
  const extraEntities = outputKeys.filter((k) => !oracle.has(k)).sort();

  return {
    fields,
    missingEntities,
    extraEntities,
    oracleCount: oracle.size,
    outputCount: outputKeys.length,
  };
}
