/**
 * MONAD GATE — accès à `data/generated/monad/`.
 *
 * Le THÈME (`theme.json` — nom stable, le `themeId` vit dedans) est partagé :
 * jauge, index des routes et registre de récompenses (référencé par
 * `node.rewardId`). Il est petit → importé statiquement ici. Les ROUTES vivent
 * toutes dans UN `routes.json` indexé par groupId — la donnée est déjà prête à
 * rendre (libellés résolus au build, cf. `datagen/generators/monad.ts`), il n'y
 * a plus de couche `loadRoute`.
 */
import themeData from '@data/generated/monad/theme.json';
import routesData from '@data/generated/monad/routes.json';
import type { MonadReward, MonadRouteFile, MonadRouteRef, MonadThemeFile } from '@contracts';

export type { MonadEdge, MonadNode, MonadNodeType, MonadReward, MonadRouteFile } from '@contracts';

const THEME = themeData as unknown as MonadThemeFile;
// Routes indexées par groupId. ~1,5 Mo — importé UNIQUEMENT par des Server
// Components (l'orchestrateur `MonadGateGuide`) ; le client ne reçoit que les
// nœuds/arêtes de SA route, jamais ce dictionnaire.
const ROUTES = routesData as unknown as Record<string, MonadRouteFile>;

/** Une route par son groupId (`undefined` si inconnue). */
export function getMonadRoute(groupId: string): MonadRouteFile | undefined {
  return ROUTES[groupId];
}

/**
 * Les routes d'un couple (profondeur, slot), une par variante de map (depth 10
 * en a deux), triées par variante. Vide si le couple n'existe pas.
 */
export function getMonadRoutesFor(depth: number, route: number): MonadRouteFile[] {
  return Object.values(ROUTES)
    .filter((r) => r.depth === depth && r.route === route)
    .sort((a, b) => a.variant - b.variant);
}

/** Le thème Monad Gate (jauge, récompenses, index des routes). */
export function monadTheme(): MonadThemeFile {
  return THEME;
}

/** Une récompense résolue par id (`node.rewardId` / `firstClearRewardId`). */
export function monadReward(id: string | undefined): MonadReward | undefined {
  return id ? THEME.rewards[id] : undefined;
}

/** Toutes les références de route, triées par (profondeur, slot, variante). */
export function monadRouteRefs(): MonadRouteRef[] {
  return [...THEME.routes].sort(
    (a, b) => a.depth - b.depth || a.route - b.route || a.variant - b.variant,
  );
}

/**
 * Références de route d'un couple (profondeur, slot) — une par variante de map
 * (depth 10 en a deux). Vide si le couple n'existe pas.
 */
export function monadRouteVariants(depth: number, route: number): MonadRouteRef[] {
  return monadRouteRefs()
    .filter((r) => r.depth === depth && r.route === route)
    .sort((a, b) => a.variant - b.variant);
}
