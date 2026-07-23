/**
 * Catégories du GUIDE EDITOR — source UNIQUE de l'ordre et des libellés,
 * partagée par le menu admin (une entrée par type) et la sidebar de chaque type.
 *
 * Les catégories de boss dérivent de `GUIDE_SPECS` (une nouvelle catégorie
 * branchée sur le shell unifié apparaît d'office dans le menu) ; general-guides
 * (contenu bespoke, un JSON par guide) ferme la liste.
 */
import { GUIDE_SPECS } from '@/lib/admin/guide-draft';

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
