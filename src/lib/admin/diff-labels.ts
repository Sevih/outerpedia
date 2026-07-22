/**
 * Libellés HUMAINS des valeurs d'un diff d'extraction.
 *
 * Un écart brut « skills[14] : 132 → 130 » est INDÉCIDABLE : ce sont des ids.
 * On résout donc les DEUX côtés — l'existant depuis le committé (l'id peut
 * avoir disparu de l'extraction, son nom ne vit plus que là), l'extrait depuis
 * l'extraction fraîche — pour que la revue se tranche sur la fiche, sans aller
 * fouiller les tables du jeu.
 *
 * Les résolveurs sont fournis par la PAGE (elle seule sait ce que vaut un id
 * dans son domaine) ; ici on ne fait que parcourir les feuilles du diff.
 */
import type { LocalizedText } from '@contracts';
import type { FieldDiff } from '@/lib/admin/review-types';
import { lRec } from '@/lib/i18n/localize';

/** Racine d'un chemin de diff : `skills[14]` → `skills`, `stats.hp.min` → `stats`. */
export const diffRoot = (path: string): string => path.split(/[.[]/)[0];

/** id → libellé, par champ racine. Un résolveur muet (undefined) laisse l'id nu. */
export type DiffResolvers = Record<string, (value: string) => string | undefined>;

/** Clé de libellé : le champ racine désambiguïse (le skill « 1 » ≠ le set « 1 »). */
export const labelKey = (root: string, value: string): string => `${root}:${value}`;

/** Libellés des feuilles dont la valeur est un ID, prêts pour `EntityDiffPanel`. */
export function diffLabels(fields: FieldDiff[], resolvers: DiffResolvers): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields) {
    const root = diffRoot(f.path);
    const resolve = resolvers[root];
    if (!resolve) continue;
    // Une feuille porte une valeur scalaire, mais un champ AJOUTÉ/RETIRÉ en bloc
    // peut porter le tableau entier — on résout les deux formes.
    const values = [f.existing, f.extracted].flatMap((v) =>
      Array.isArray(v) ? v : [v],
    ) as unknown[];
    for (const v of values) {
      if (typeof v !== 'string' || out[labelKey(root, v)]) continue;
      const label = resolve(v);
      if (label) out[labelKey(root, v)] = label;
    }
  }
  return out;
}

/**
 * Libellé d'un skill : son nom, à défaut son TYPE — beaucoup de skills annexes
 * (finishers de chaîne, aériens) n'ont pas de nom localisé, et « strike_finish »
 * reste infiniment plus parlant qu'un id nu.
 */
export function skillLabel(s?: { name?: LocalizedText; type?: string }): string | undefined {
  if (!s) return undefined;
  const name = s.name ? lRec(s.name, 'en') : '';
  if (name && s.type) return `${name} · ${s.type}`;
  return name || s.type || undefined;
}
