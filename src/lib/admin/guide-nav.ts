/**
 * Catégories du GUIDE EDITOR — source UNIQUE de l'ordre et des libellés,
 * partagée par le menu admin (une entrée par type) et la sidebar de chaque type.
 *
 * Les catégories de boss dérivent de `GUIDE_SPECS` (une nouvelle catégorie
 * branchée sur le shell unifié apparaît d'office dans le menu) ; general-guides
 * (contenu bespoke, un JSON par guide) ferme la liste.
 *
 * Le MENU de l'admin, lui, n'en montre plus que ce qui n'est pas encore porté
 * dans quick — `adminGuideMenu` : depuis le 11/10/2026 (lot F18), les guides de
 * boss de `GUIDE_SPECS` s'éditent dans quick (section « Guides ») et leurs
 * liens sortent de l'admin ; `general-guides` reste (lot F19). Et une catégorie
 * dont TOUS les guides sont cachés ne se propose plus nulle part
 * (`categoriesWithVisibleGuide`, la règle de `visibleCategorySlugs` du site) :
 * c'est ainsi qu'Adventure License, 26 guides tous cachés, quitte les menus
 * sans qu'on la retire de `GUIDE_SPECS`, que les tests de specs lisent encore.
 */
import { GUIDE_SPECS } from '@/lib/admin/guide-draft';
import { listGuides, type Guide } from '@/lib/data/guides';

export interface GuideEditorCategory {
  slug: string;
  label: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  'joint-challenge': 'Joint Challenge',
  'world-boss': 'World Boss',
  'special-request': 'Special Request',
  'irregular-extermination': 'Irregular Extermination',
  'adventure-license': 'Adventure License',
  adventure: 'Adventure',
  'dimensional-singularity': 'Dimensional Singularity',
  'general-guides': 'General guides',
};

export const GUIDE_EDITOR_CATEGORIES: GuideEditorCategory[] = [
  ...Object.keys(GUIDE_SPECS).map((slug) => ({ slug, label: CATEGORY_LABEL[slug] ?? slug })),
  { slug: 'general-guides', label: CATEGORY_LABEL['general-guides'] },
];

/** Libellé humain d'une catégorie (repli sur le slug si inconnue). */
export const guideCategoryLabel = (slug: string): string => CATEGORY_LABEL[slug] ?? slug;

/** Ce que la règle de visibilité lit d'un guide : sa catégorie, et s'il est caché. */
export type VisibleGuideLike = Pick<Guide, 'category' | 'hidden'>;

/**
 * Les catégories de `slugs` qui ont AU MOINS UN guide visible — la règle de
 * `visibleCategorySlugs` du site, appliquée à n'importe quelle liste : le menu
 * de l'admin, la vue d'ensemble de quick, ses cibles de vidéo. Une catégorie
 * sans aucun guide n'y est pas non plus.
 */
export function categoriesWithVisibleGuide(
  slugs: readonly string[],
  guides: readonly VisibleGuideLike[] = listGuides(),
): string[] {
  const alive = new Set<string>(guides.filter((g) => !g.hidden).map((g) => g.category));
  return slugs.filter((slug) => alive.has(slug));
}

/** Une catégorie est-elle vivante (au moins un guide visible) ? */
export const hasVisibleGuide = (
  category: string,
  guides: readonly VisibleGuideLike[] = listGuides(),
): boolean => categoriesWithVisibleGuide([category], guides).length > 0;

/** Les catégories que quick édite (section « Guides ») : plus de lien pour elles dans l'admin. */
export const isGuideCategoryInQuick = (slug: string): boolean => Object.hasOwn(GUIDE_SPECS, slug);

/**
 * Les entrées du groupe « Guide editor » du menu de l'admin : les catégories
 * pas encore portées dans quick, parmi celles qui ont un guide visible. Les
 * libellés et l'ordre restent ceux de `GUIDE_EDITOR_CATEGORIES`.
 */
export function adminGuideMenu(
  guides: readonly VisibleGuideLike[] = listGuides(),
): GuideEditorCategory[] {
  const alive = new Set(
    categoriesWithVisibleGuide(
      GUIDE_EDITOR_CATEGORIES.map((c) => c.slug),
      guides,
    ),
  );
  return GUIDE_EDITOR_CATEGORIES.filter(
    (c) => !isGuideCategoryInQuick(c.slug) && alive.has(c.slug),
  );
}
