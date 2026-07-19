/**
 * Accès au DOMAINE OUTILS (`data/curated/tools/_categories.json` + `_index.json`).
 * Liste curée éditoriale (pas de la donnée de jeu) → import statique figé.
 * Les libellés (catégorie, titre, description d'outil) vivent en i18n
 * (`tools.category.<slug>`, `tools.<slug>`, `tools.<slug>.desc`).
 */
import categoriesData from '@data/curated/tools/_categories.json';
import indexData from '@data/curated/tools/_index.json';

export type ToolStatus = 'available' | 'coming-soon' | 'hidden' | 'unlisted';

export interface ToolMeta {
  slug: string;
  /** Sprite (sous-dossier inclus, ex. `nav/CM_Most_Used`) → `img.toolIcon`. */
  icon: string;
  category: string;
  order: number;
  status: ToolStatus;
}

export interface ToolCategory {
  slug: string;
  order: number;
}

const CATEGORIES = categoriesData as Record<string, { order: number }>;
const INDEX = indexData as Record<
  string,
  { icon: string; category: string; order: number; status: string }
>;

/** Catégories triées par ordre. */
export function getToolCategories(): ToolCategory[] {
  return Object.entries(CATEGORIES)
    .map(([slug, d]) => ({ slug, order: d.order }))
    .sort((a, b) => a.order - b.order);
}

/** Outils VISIBLES (hors `hidden`/`unlisted`), triés par ordre. */
export function getVisibleTools(): ToolMeta[] {
  return Object.entries(INDEX)
    .map(([slug, d]) => ({
      slug,
      icon: d.icon,
      category: d.category,
      order: d.order,
      status: d.status as ToolStatus,
    }))
    .filter((t) => t.status !== 'hidden' && t.status !== 'unlisted')
    .sort((a, b) => a.order - b.order);
}

/** Outils groupés par catégorie (ordre des catégories ; groupes vides écartés). */
export function getToolsByCategory(): { category: ToolCategory; tools: ToolMeta[] }[] {
  const tools = getVisibleTools();
  return getToolCategories()
    .map((category) => ({ category, tools: tools.filter((t) => t.category === category.slug) }))
    .filter((g) => g.tools.length > 0);
}
