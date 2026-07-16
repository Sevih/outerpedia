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
import type { MonadReward, MonadRouteFile, MonadThemeFile } from '@contracts';

export type { MonadEdge, MonadNode, MonadNodeType, MonadReward, MonadRouteFile } from '@contracts';

const THEME = themeData as unknown as MonadThemeFile;
// Routes indexées par groupId. ~1,5 Mo — importé UNIQUEMENT par des Server
// Components (l'orchestrateur `MonadGateGuide`) ; le client ne reçoit que les
// nœuds/arêtes de SA route, jamais ce dictionnaire.
const ROUTES = routesData as unknown as Record<string, MonadRouteFile>;

/**
 * Les routes d'un couple (profondeur, slot), une par variante de map (depth 10
 * en a deux), triées par variante. Vide si le couple n'existe pas.
 */
export function getMonadRoutesFor(depth: number, route: number): MonadRouteFile[] {
  return Object.values(ROUTES)
    .filter((r) => r.depth === depth && r.route === route)
    .sort((a, b) => a.variant - b.variant);
}

/** Une récompense résolue par id (`node.rewardId` / `firstClearRewardId`). */
export function monadReward(id: string | undefined): MonadReward | undefined {
  return id ? THEME.rewards[id] : undefined;
}
