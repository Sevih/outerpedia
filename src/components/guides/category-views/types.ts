import type { ReactNode } from 'react';
import type { Lang } from '@/lib/i18n/config';
import type { Guide } from '@/lib/data/guides';
import type { GuideCategorySlug } from '@/lib/data/guide-categories';

/** Props d'une vue de catégorie (Server Component). */
export interface CategoryViewProps {
  lang: Lang;
  category: GuideCategorySlug;
  /** Guides VISIBLES de la catégorie, déjà triés (order croissant, puis date). */
  guides: Guide[];
}

/** Une vue de catégorie — peut être asynchrone (accès données / i18n). */
export type CategoryView = (props: CategoryViewProps) => ReactNode | Promise<ReactNode>;
