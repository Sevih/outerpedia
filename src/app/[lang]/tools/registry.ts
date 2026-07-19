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
};

/** Slugs des outils portés (routeur + `generateStaticParams`). */
export const PORTED_TOOL_SLUGS = Object.keys(TOOL_COMPONENTS);
