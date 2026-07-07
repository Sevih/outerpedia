import type { Route } from 'next';
import type { Lang } from '@/lib/i18n/config';

/**
 * Chemin interne locale-aware. Renvoie le path tel quel : le routing par
 * SOUS-DOMAINE (voir `proxy.ts`) fait qu'aucun préfixe de langue n'apparaît dans
 * les hrefs internes. Le changement de langue se fait en changeant l'hôte.
 */
export function localePath(_lang: Lang, path: string): Route {
  return path as Route;
}
