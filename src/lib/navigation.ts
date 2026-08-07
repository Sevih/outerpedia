import type { Route } from 'next';
import type { Lang } from '@/lib/i18n/config';

/**
 * Chemin interne locale-aware. Renvoie le path tel quel : le routing par
 * SOUS-DOMAINE (voir `proxy.ts`) fait qu'aucun préfixe de langue n'apparaît dans
 * les hrefs internes. Le changement de langue se fait en changeant l'hôte.
 *
 * NE PAS la supprimer en la prenant pour un no-op — l'audit du 07/08 a failli
 * le faire. Le `_lang` ne sert effectivement plus à rien depuis le passage aux
 * sous-domaines, mais le `as Route` du corps, LUI, porte tout le poids :
 * `typedRoutes: true` (next.config.ts) fait de `Route` une union de littéraux,
 * à laquelle une chaîne construite n'est pas assignable. Or 44 des 68 appels
 * passent un template (`/characters/${slug}`). Retirer la fonction ne
 * supprimerait donc pas un cast : elle en disperserait 44.
 *
 * C'est ce qui la garde utile : UN point de cast, au lieu d'autant de `as Route`
 * disséminés dans les vues. Le paramètre de langue reste le point d'accroche si
 * le routing repassait un jour par le path (`/fr/…`) — auquel cas c'est ici, et
 * nulle part ailleurs, que le préfixe se poserait.
 *
 * NB : `typedRoutes` ne s'applique qu'avec `.next/dev/types/routes.d.ts`
 * généré — un `tsc --noEmit` sur un `.next` vide ne le vérifie pas. La CI, si.
 */
export function localePath(_lang: Lang, path: string): Route {
  return path as Route;
}
