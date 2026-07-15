/**
 * RENDU PARTAGÉ d'un guide MONAD GATE (Server Component). Chaque `index.tsx` de
 * `_contents/monad-gate/<slug>` délègue ici : le guide DÉCLARE sa `depth` et sa
 * `route` (meta, requis au scan), l'orchestrateur charge la/les variante(s) de
 * map correspondante(s), résout les chaînes d'UI, les libellés de type de nœud
 * et les récompenses (côté serveur), puis passe le tout au wrapper client.
 *
 * Le titre (nom de la région) est déjà l'H1 de la page détail — pas répété ici.
 */
import { getT } from '@/i18n';
import type { GuideContentProps } from '@/lib/data/guides';
import { getCatalogEntry } from '@/lib/data/items';
import {
  getMonadRoutesFor,
  monadReward,
  type MonadNodeType,
  type MonadRouteFile,
} from '@/lib/data/monad';
import { lRec } from '@/lib/i18n/localize';
import type { Lang } from '@/lib/i18n/config';
import { img } from '@/lib/images';
import { NODE_STYLES } from './nodeStyles';
import type { MonadStrings } from './MonadGateMap';
import type { RewardDisplay, RewardLine } from './MonadRouteReward';
import MonadRouteClient, { type RouteVariant } from './MonadRouteClient';

/** Free Ether (récompense `crystal` d'une route) — id d'asset du catalogue. */
const FREE_ETHER_ID = 'SYS_ASSET_FREE_CRYSTAL';

function qty(min: number, max: number): string {
  return min === max ? String(min) : `${min}-${max}`;
}

/**
 * Agrège et résout les récompenses d'une route : par clear (nœuds `final`) et
 * bonus de premier clear (nœuds `tending`). Comme la V2, seuls les items
 * `RIT_ITEM` sont détaillés, plus l'or et le Free Ether.
 */
function resolveRewards(route: MonadRouteFile, lang: Lang): RewardDisplay {
  const build = (rewardIds: Set<string>): RewardLine[] => {
    const items = new Map<string, { min: number; max: number }>();
    let gold = 0;
    let ether = 0;
    for (const rid of rewardIds) {
      const rew = monadReward(rid);
      if (!rew) continue;
      if (rew.gold) gold += rew.gold.min;
      if (rew.crystal) ether += rew.crystal.min;
      for (const it of rew.items) {
        if (it.type !== 'RIT_ITEM') continue;
        const cur = items.get(it.typeId);
        if (cur) {
          cur.min += it.min;
          cur.max += it.max;
        } else {
          items.set(it.typeId, { min: it.min, max: it.max });
        }
      }
    }
    const lines: RewardLine[] = [];
    for (const [id, { min, max }] of items) {
      const entry = getCatalogEntry(id);
      if (!entry) continue;
      lines.push({
        name: lRec(entry.name, lang),
        iconSrc: img.item(entry.icon),
        grade: entry.grade,
        qty: qty(min, max),
      });
    }
    if (ether > 0) {
      const e = getCatalogEntry(FREE_ETHER_ID);
      if (e)
        lines.push({
          name: lRec(e.name, lang),
          iconSrc: img.item(e.icon),
          grade: e.grade,
          qty: qty(ether, ether),
        });
    }
    if (gold > 0) {
      lines.push({ name: 'Gold', iconSrc: img.gold(), grade: 'normal', qty: qty(gold, gold) });
    }
    return lines;
  };

  const clearIds = new Set<string>();
  const firstClearIds = new Set<string>();
  for (const n of route.nodes) {
    if (n.type === 'final' && n.rewardId) clearIds.add(n.rewardId);
    if (n.type === 'tending' && n.firstClearRewardId) firstClearIds.add(n.firstClearRewardId);
  }
  return { clear: build(clearIds), firstClear: build(firstClearIds) };
}

export default async function MonadGateGuide({ lang, guide }: GuideContentProps) {
  const t = await getT(lang);

  if (guide.depth === undefined || guide.route === undefined) {
    throw new Error(
      `MonadGateGuide : « ${guide.category}/${guide.slug} » sans depth/route dans son meta.`,
    );
  }

  const routes = getMonadRoutesFor(guide.depth, guide.route);
  if (routes.length === 0) {
    throw new Error(
      `MonadGateGuide : aucune route pour depth ${guide.depth} route ${guide.route} ` +
        `(« ${guide.category}/${guide.slug} ») — vérifier data/generated/monad/routes.json.`,
    );
  }

  // Libellés de type de nœud (`monad.node.<type>`) pré-résolus pour le client.
  const nodeLabels = Object.fromEntries(
    (Object.keys(NODE_STYLES) as MonadNodeType[]).map((type) => [type, t(`monad.node.${type}`)]),
  ) as Record<MonadNodeType, string>;

  const strings: MonadStrings = {
    trueEndingPath: t('monad.ui.trueEndingPath'),
    compact: t('monad.ui.compact'),
    reset: t('monad.ui.reset'),
    fullscreen: t('monad.ui.fullscreen'),
    noOptions: t('monad.ui.noOptions'),
    required: t('monad.ui.required'),
    grants: t('monad.ui.grants'),
    unnamedPath: t('monad.ui.unnamedPath'),
    clickToReveal: t('monad.ui.clickToReveal'),
    choiceDoesntMatter: t('monad.ui.choiceDoesntMatter'),
    trueEndingChoices: t('monad.trueEndingChoices'),
    nodeLabels,
  };

  const rewardLabels = { rewards: t('monad.rewards'), firstClear: t('monad.rewards.firstClear') };

  const variants: RouteVariant[] = routes.map((route, i) => ({
    // Étiquette d'onglet A, B, C… (uniquement affichée quand il y a >1 variante).
    label: t('guides.monad_gate.variant', { v: String.fromCharCode(65 + i) }),
    route,
    reward: resolveRewards(route, lang),
  }));

  return (
    <MonadRouteClient
      variants={variants}
      lang={lang}
      strings={strings}
      rewardLabels={rewardLabels}
    />
  );
}
