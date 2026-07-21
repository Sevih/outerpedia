import type { ComponentType } from 'react';
import type { Lang } from '@/lib/i18n/config';

/**
 * Outils PORTÉS en V3 : slug → import dynamique du composant de l'outil (server
 * wrapper dans `_contents/<slug>`, reçoit `lang` et résout ses propres libellés
 * avant de rendre son sous-composant client). Le routeur `[lang]/[slug]` sert
 * ces slugs ; tout slug absent d'ici renvoie un 404. Étendue au fil du portage.
 */
export const TOOL_COMPONENTS: Record<
  string,
  () => Promise<{ default: ComponentType<{ lang: Lang }> }>
> = {
  ost: () => import('./_contents/ost'),
  wallpapers: () => import('./_contents/wallpapers'),
  '4-comics': () => import('./_contents/4-comics'),
  tierlistpve: () => import('./_contents/tierlistpve'),
  tierlistpvp: () => import('./_contents/tierlistpvp'),
  'ee-priority-base': () => import('./_contents/ee-priority-base'),
  'ee-priority-plus10': () => import('./_contents/ee-priority-plus10'),
  'most-used-units': () => import('./_contents/most-used-units'),
  'gear-usage-statistics': () => import('./_contents/gear-usage-statistics'),
  'gear-usage-finder': () => import('./_contents/gear-usage-finder'),
  'patch-history': () => import('./_contents/patch-history'),
  'pull-simulator': () => import('./_contents/pull-simulator'),
  'progress-tracker': () => import('./_contents/progress-tracker'),
  'tier-list-maker': () => import('./_contents/tier-list-maker'),
};

/** Slugs des outils portés (routeur + `generateStaticParams`). */
export const PORTED_TOOL_SLUGS = Object.keys(TOOL_COMPONENTS);
