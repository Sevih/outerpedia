/**
 * Validateur runtime maison (zéro dépendance) — les CONTRATS « à dents ».
 *
 * Un `Schema` décrit la forme attendue d'une sortie d'extracteur. `validate`
 * renvoie la liste des écarts (chemin + message) ; vide = conforme. C'est ce qui
 * répond au défaut « pas de typage/contrats » de l'ancien extracteur : chaque
 * entité produite est vérifiée à l'exécution, pas seulement à la compilation.
 *
 * Volontairement minuscule : on couvre ce dont les specs ont besoin
 * (string/number/boolean/langDict/array/record/object), pas plus.
 */
import { GAME_LANGS } from '../../lib/lang';

export type Schema =
  | { kind: 'string'; optional?: boolean; enum?: readonly string[] }
  | { kind: 'number'; optional?: boolean; int?: boolean; min?: number }
  | { kind: 'boolean'; optional?: boolean }
  | { kind: 'langDict'; optional?: boolean }
  | { kind: 'array'; of: Schema; optional?: boolean; minItems?: number }
  | { kind: 'record'; of: Schema; optional?: boolean }
  | { kind: 'object'; fields: Record<string, Schema>; optional?: boolean };

/** Un écart de validation : où, et quoi. */
export interface Issue {
  path: string;
  message: string;
}

/** Valide `value` contre `schema`. Renvoie les écarts (vide = conforme). */
export function validate(value: unknown, schema: Schema, path = '$'): Issue[] {
  // Champ absent : OK si optionnel, sinon écart unique.
  if (value === undefined || value === null) {
    return schema.optional ? [] : [{ path, message: 'requis mais absent' }];
  }

  switch (schema.kind) {
    case 'string': {
      if (typeof value !== 'string')
        return [{ path, message: `attendu string, reçu ${typeof value}` }];
      if (schema.enum && !schema.enum.includes(value)) {
        return [{ path, message: `« ${value} » hors énumération [${schema.enum.join(', ')}]` }];
      }
      return [];
    }
    case 'number': {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        return [{ path, message: `attendu number, reçu ${typeof value}` }];
      }
      if (schema.int && !Number.isInteger(value)) return [{ path, message: 'attendu entier' }];
      if (schema.min !== undefined && value < schema.min) {
        return [{ path, message: `< min (${schema.min})` }];
      }
      return [];
    }
    case 'boolean':
      return typeof value === 'boolean'
        ? []
        : [{ path, message: `attendu boolean, reçu ${typeof value}` }];

    case 'langDict': {
      if (typeof value !== 'object') return [{ path, message: 'attendu langDict (objet)' }];
      const issues: Issue[] = [];
      for (const lang of GAME_LANGS) {
        const v = (value as Record<string, unknown>)[lang];
        if (typeof v !== 'string')
          issues.push({ path: `${path}.${lang}`, message: 'langue manquante/non-string' });
      }
      return issues;
    }
    case 'array': {
      if (!Array.isArray(value)) return [{ path, message: 'attendu array' }];
      const issues: Issue[] = [];
      if (schema.minItems !== undefined && value.length < schema.minItems) {
        issues.push({ path, message: `< minItems (${schema.minItems})` });
      }
      value.forEach((v, i) => issues.push(...validate(v, schema.of, `${path}[${i}]`)));
      return issues;
    }
    case 'record': {
      if (typeof value !== 'object' || Array.isArray(value))
        return [{ path, message: 'attendu record (objet)' }];
      const issues: Issue[] = [];
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        issues.push(...validate(v, schema.of, `${path}.${k}`));
      }
      return issues;
    }
    case 'object': {
      if (typeof value !== 'object' || Array.isArray(value))
        return [{ path, message: 'attendu object' }];
      const issues: Issue[] = [];
      for (const [k, sub] of Object.entries(schema.fields)) {
        issues.push(...validate((value as Record<string, unknown>)[k], sub, `${path}.${k}`));
      }
      return issues;
    }
  }
}
