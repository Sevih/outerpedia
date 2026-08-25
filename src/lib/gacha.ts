/**
 * Moteur de GACHA du pull simulator : session immuable, tirages avec garantie
 * 2★ du x10 et mileage. Logique PURE — aucune donnée de perso (le client
 * résout qui sort) et aucun import de JSON : la config d'une bannière se
 * DÉRIVE de `recruit.json` (`bannerConfigOf`), que l'appelant SERVEUR lit et
 * passe en props. Les taux et coûts vivaient ici en dur ; ils se sont
 * périmés dès la refonte du 25/08 (le Demiurge a gagné la garantie du x10).
 */
import type { RecruitKindInfo } from '@contracts';

export type BannerType = 'custom' | 'rateup' | 'premium' | 'limited';

/** Compteur de garantie d'une bannière (« le focus tombe en N tirages »). */
export interface GuaranteeRule {
  /** Tirages au bout desquels le focus est forcé. */
  at: number;
  /** Nombre de garanties utilisables ; `null` = sans plafond. */
  max: number | null;
}

/**
 * La garantie du 25/08 par bannière — ÉDITORIAL : aucune table du jeu ne la
 * porte (vérifié en montant le guide banner-mileage), elle vient des notes de
 * patch. `custom` est la fausse bannière « All Heroes » du simulateur, qui
 * n'existe pas dans le jeu : rien à y garantir.
 */
const GUARANTEE_OF: Record<BannerType, GuaranteeRule | null> = {
  custom: null,
  rateup: { at: 100, max: 2 },
  premium: { at: 100, max: 1 },
  limited: { at: 100, max: 2 },
};

/** Ordre d'affichage des bannières du simulateur. */
export const BANNER_TYPES: BannerType[] = ['custom', 'rateup', 'premium', 'limited'];

/** Bannière du simulateur → type de `recruit.json` (le pickup s'y dit `pickup`). */
export const RECRUIT_KIND_OF = {
  custom: 'custom',
  rateup: 'pickup',
  premium: 'premium',
  limited: 'limited',
} as const;

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
  /** Compteur de garantie (pity du 25/08) — `null` si la bannière n'en a pas. */
  guarantee: GuaranteeRule | null;
  /** Tirage quotidien gratuit disponible ? */
  freePull: boolean;
}

/** Taux d'un palier par suffixe de clé TextSystem (absent = 0). */
function rateOf(info: RecruitKindInfo, suffix: string): number {
  return info.rates.find((r) => r.titleKey.endsWith(suffix))?.percent ?? 0;
}

/**
 * Config d'une bannière DÉRIVÉE de sa fiche générée. Le Custom n'a pas de
 * palier pickup (`_TITLE_05`) : son taux vedette est 0, et le simulateur ne
 * modélise donc pas ses 3 persos choisis.
 *
 * La garantie du x10 se lit comme partout ailleurs : une ligne à 0 % sur le
 * slot garanti = un tirage remonté.
 */
export function bannerConfigOf(type: BannerType, info: RecruitKindInfo): BannerConfig {
  return {
    type,
    focus3Rate: rateOf(info, '_TITLE_05'),
    offFocus3Rate: rateOf(info, '_TITLE_03'),
    rate2: rateOf(info, '_TITLE_02'),
    rate1: rateOf(info, '_TITLE_01'),
    mileageCap: info.mileageCost ?? 200,
    etherCost: info.price1,
    tenPullGuarantee: info.rates.some((r) => r.percent > 0 && r.confirmPercent === 0),
    freePull: info.freeCount > 0,
    guarantee: GUARANTEE_OF[type],
  };
}

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
  /** Tirages depuis la dernière garantie (obtenue ou forcée). */
  pullsSinceGuarantee: number;
  /** Garanties déjà consommées sur cette bannière. */
  guaranteesUsed: number;
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
    pullsSinceGuarantee: 0,
    guaranteesUsed: 0,
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

/** Reste-t-il une garantie utilisable sur cette bannière ? */
export function guaranteeLeft(session: GachaSession, config: BannerConfig): boolean {
  const rule = config.guarantee;
  if (!rule) return false;
  return rule.max === null || session.guaranteesUsed < rule.max;
}

/**
 * Tirages d'un lot, compteur de garantie compris.
 *
 * Le compteur avance tirage par tirage : au `at`-ième, le focus est FORCÉ ;
 * et si le focus tombe de lui-même avant, la garantie en cours est quand même
 * consommée (« considered completed once » — le compteur repart de zéro).
 * Une fois le plafond atteint, la bannière tire sans filet.
 */
function pullMulti(
  config: BannerConfig,
  count: number,
  state: { since: number; used: number },
): PullResult[] {
  const results: PullResult[] = [];
  for (let i = 0; i < count; i++) {
    const rule = config.guarantee;
    const armed = rule !== null && (rule.max === null || state.used < rule.max);
    state.since += 1;
    const result =
      armed && state.since >= rule.at ? { rarity: 3 as const, isFocus: true } : rollSingle(config);
    if (result.isFocus && armed) {
      state.used += 1;
      state.since = 0;
    }
    results.push(result);
  }
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
  config: BannerConfig,
): { results: PullResult[]; session: GachaSession } {
  const state = { since: session.pullsSinceGuarantee, used: session.guaranteesUsed };
  const results = pullMulti(config, count, state);

  const next: GachaSession = {
    ...session,
    totalPulls: session.totalPulls + count,
    mileage: session.mileage + count,
    totalEther: session.totalEther + count * config.etherCost,
    pullsSinceGuarantee: state.since,
    guaranteesUsed: state.used,
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
  // (Le compteur du premier 3★ était amorcé à totalPulls AVANT de re-parcourir
  // tout l'historique — numéro compté double. Corrigé : on compte de zéro.)
  next.pullsToFirst3Star ??= firstPullNumber(next.history, (r) => r.rarity === 3);
  next.pullsToFocus ??= firstPullNumber(next.history, (r) => r.isFocus);

  return { results, session: next };
}

/** Échange le mileage plein contre l'unité garantie (null si pas assez). */
export function redeemMileage(session: GachaSession, config: BannerConfig): GachaSession | null {
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

export function canUseMileage(session: GachaSession, config: BannerConfig): boolean {
  return session.mileage >= config.mileageCap;
}
