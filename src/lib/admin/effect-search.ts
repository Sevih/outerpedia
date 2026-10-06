/**
 * Recherche de la liste des effets de l'admin (`/admin/editor/effects`).
 *
 * Fichier PUR, sans lecture disque : le serveur y prépare la botte de foin de
 * chaque effet (`effectHaystack`), le composant client y filtre le catalogue à
 * chaque frappe (`filterEffectCatalog`). Les deux côtés passent par
 * `normalizeSearchText` — la même normalisation que la palette du site.
 */
import { normalizeSearchText } from '@/lib/search-text';

/** Ce que la recherche lit d'un effet : id, clés éditoriales, nom par langue. */
export interface EffectSearchFields {
  id: string;
  /** Clés `BT_*` de l'index généré + `keys` curées. */
  keys: readonly string[];
  name: Record<string, string>;
}

/**
 * Botte de foin d'un effet : ses champs cherchables normalisés, un par ligne.
 * Le saut de ligne sépare les champs — une saisie n'en contient jamais, donc
 * aucune correspondance ne peut chevaucher deux champs.
 */
export function effectHaystack(e: EffectSearchFields): string {
  return [e.id, ...e.keys, ...Object.values(e.name)]
    .map(normalizeSearchText)
    .filter(Boolean)
    .join('\n');
}

/** Une saisie vide garde tout ; sinon elle doit se trouver dans un des champs. */
export function effectMatches(haystack: string, query: string): boolean {
  const needle = normalizeSearchText(query);
  return !needle || haystack.includes(needle);
}

/** Le catalogue tel que la page le range : paires miroir, puis orphelins. */
export interface EffectCatalog<T> {
  pairs: { buff: T; debuff: T }[];
  orphanBuffs: T[];
  orphanDebuffs: T[];
}

/**
 * Filtre le catalogue sur une saisie. Une PAIRE reste entière dès qu'un de ses
 * deux membres correspond (on cherche un effet, on veut voir son miroir) ; les
 * deux colonnes d'orphelins se filtrent chacune de son côté.
 */
export function filterEffectCatalog<T extends { haystack: string }>(
  catalog: EffectCatalog<T>,
  query: string,
): EffectCatalog<T> {
  if (!normalizeSearchText(query)) return catalog;
  const hit = (e: T) => effectMatches(e.haystack, query);
  return {
    pairs: catalog.pairs.filter((p) => hit(p.buff) || hit(p.debuff)),
    orphanBuffs: catalog.orphanBuffs.filter(hit),
    orphanDebuffs: catalog.orphanDebuffs.filter(hit),
  };
}
