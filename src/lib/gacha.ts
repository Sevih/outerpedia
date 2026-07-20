/**
 * Moteur de GACHA du pull simulator (portage V2) : configs de bannière (taux
 * officiels du jeu), session immuable, tirages avec garantie 2★ du x10 et
 * mileage. Logique PURE (aucune donnée de perso — le client résout qui sort).
 */

export type BannerType = 'custom' | 'rateup' | 'premium' | 'limited';

export interface BannerConfig {
  type: BannerType;
  /** Taux du 3★ VEDETTE (somme si plusieurs focus). */
  focus3Rate: number;
  /** Taux d'un 3★ hors focus. */
  offFocus3Rate: number;
  rate2: number;
  rate1: number;
  /** Mileage requis pour l'unité garantie. */
  mileageCap: number;
  /** Coût en éther d'un tirage. */
  etherCost: number;
  /** Le x10 garantit-il au moins un 2★ ? */
  tenPullGuarantee: boolean;
  /** Tirage quotidien gratuit disponible ? */
  freePull: boolean;
}

export const BANNER_CONFIGS: Record<BannerType, BannerConfig> = {
  custom: {
    type: 'custom',
    focus3Rate: 0,
    offFocus3Rate: 2.5,
    rate2: 19,
    rate1: 78.5,
    mileageCap: 200,
    etherCost: 150,
    tenPullGuarantee: true,
    freePull: true,
  },
  rateup: {
    type: 'rateup',
    focus3Rate: 1.25,
    offFocus3Rate: 1.25,
    rate2: 19,
    rate1: 78.5,
    mileageCap: 200,
    etherCost: 150,
    tenPullGuarantee: true,
    freePull: false,
  },
  premium: {
    type: 'premium',
    focus3Rate: 1.25,
    offFocus3Rate: 2.5,
    rate2: 19,
    rate1: 77.25,
    mileageCap: 200,
    etherCost: 225,
    tenPullGuarantee: false,
    freePull: true,
  },
  limited: {
    type: 'limited',
    focus3Rate: 1.25,
    offFocus3Rate: 1.25,
    rate2: 19,
    rate1: 78.5,
    mileageCap: 150,
    etherCost: 150,
    tenPullGuarantee: true,
    freePull: false,
  },
};

export interface PullResult {
  rarity: 1 | 2 | 3;
  isFocus: boolean;
}

export interface GachaSession {
  bannerType: BannerType;
  totalPulls: number;
  mileage: number;
  pullsToFirst3Star: number | null;
  pullsToFocus: number | null;
  totalEther: number;
  history: PullResult[][];
  counts: { star1: number; star2: number; star3: number; star3Focus: number };
}

export function createSession(bannerType: BannerType): GachaSession {
  return {
    bannerType,
    totalPulls: 0,
    mileage: 0,
    pullsToFirst3Star: null,
    pullsToFocus: null,
    totalEther: 0,
    history: [],
    counts: { star1: 0, star2: 0, star3: 0, star3Focus: 0 },
  };
}

function rollSingle(config: BannerConfig): PullResult {
  const roll = Math.random() * 100;
  if (roll < config.focus3Rate) return { rarity: 3, isFocus: true };
  if (roll < config.focus3Rate + config.offFocus3Rate) return { rarity: 3, isFocus: false };
  if (roll < config.focus3Rate + config.offFocus3Rate + config.rate2)
    return { rarity: 2, isFocus: false };
  return { rarity: 1, isFocus: false };
}

function pullMulti(config: BannerConfig, count: number): PullResult[] {
  const results: PullResult[] = [];
  for (let i = 0; i < count; i++) results.push(rollSingle(config));
  // Garantie du x10 : aucun 2★+ → le dernier 1★ est promu 2★.
  if (count === 10 && config.tenPullGuarantee && !results.some((r) => r.rarity >= 2)) {
    const last = results.findLastIndex((r) => r.rarity === 1);
    if (last !== -1) results[last] = { rarity: 2, isFocus: false };
  }
  return results;
}

/** Numéro (1-indexé) du premier tirage de l'historique qui matche, ou null. */
function firstPullNumber(
  history: PullResult[][],
  match: (r: PullResult) => boolean,
): number | null {
  let n = 0;
  for (const batch of history)
    for (const r of batch) {
      n++;
      if (match(r)) return n;
    }
  return null;
}

export function performPulls(
  session: GachaSession,
  count: 1 | 10,
): { results: PullResult[]; session: GachaSession } {
  const config = BANNER_CONFIGS[session.bannerType];
  const results = pullMulti(config, count);

  const next: GachaSession = {
    ...session,
    totalPulls: session.totalPulls + count,
    mileage: session.mileage + count,
    totalEther: session.totalEther + count * config.etherCost,
    history: [...session.history, results],
    counts: { ...session.counts },
  };
  for (const r of results) {
    if (r.rarity === 1) next.counts.star1++;
    else if (r.rarity === 2) next.counts.star2++;
    else {
      next.counts.star3++;
      if (r.isFocus) next.counts.star3Focus++;
    }
  }

  // « Premier 3★ » / « premier focus » : position réelle dans l'historique.
  // (La V2 amorçait le compteur du premier 3★ à totalPulls AVANT de re-parcourir
  // tout l'historique — numéro compté double. Corrigé : on compte de zéro.)
  next.pullsToFirst3Star ??= firstPullNumber(next.history, (r) => r.rarity === 3);
  next.pullsToFocus ??= firstPullNumber(next.history, (r) => r.isFocus);

  return { results, session: next };
}

/** Échange le mileage plein contre l'unité garantie (null si pas assez). */
export function redeemMileage(session: GachaSession): GachaSession | null {
  const config = BANNER_CONFIGS[session.bannerType];
  if (session.mileage < config.mileageCap) return null;
  return {
    ...session,
    mileage: session.mileage - config.mileageCap,
    counts: {
      ...session.counts,
      star3: session.counts.star3 + 1,
      star3Focus: session.counts.star3Focus + 1,
    },
  };
}

export function canUseMileage(session: GachaSession): boolean {
  return session.mileage >= BANNER_CONFIGS[session.bannerType].mileageCap;
}
