/**
 * Guide « Ether Income » — calculateur de revenus (portage V2). Le SERVEUR
 * résout tout (libellés 5 langues, sources éditoriales, échelles de rangs
 * DÉRIVÉES du jeu — data/generated/ether-rankings.json) et passe un modèle
 * plat au calculateur client. Les paliers par défaut sont désignés
 * structurellement (data.ts) : leurs montants suivent le jeu, pas la V2
 * (dont guild raid et world boss étaient périmés — doublés depuis).
 */
import etherRankingsData from '@data/generated/ether-rankings.json';
import type { EtherRankTier, EtherRankingsData, LocalizedText } from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { localePath } from '@/lib/navigation';
import { Prose } from '@/components/guides/editorial/blocks';
import { itemChipByName } from '@/components/guides/editorial/banner/items';
import {
  DAILY_SOURCES,
  DEFAULTS,
  MONTHLY_SOURCES,
  VARIABLE_SOURCE_IDS,
  WEEKLY_SOURCES,
  type EtherSource,
} from './data';
import { LABELS, SOURCE_LABELS, SOURCE_NOTES, VARIABLE_ITEMS } from './labels';
import {
  EtherCalculator,
  type CalculatorModel,
  type LadderOption,
  type SourceRow,
} from './Calculator';

const RANKINGS = etherRankingsData as unknown as EtherRankingsData;

/** « voir plus ici » du lien coupons (verbatim V2). */
const COUPON_LINK_LABEL: LocalizedText = {
  en: 'see more here',
  jp: '詳細はこちら',
  kr: '자세히 보기',
  zh: '点击查看',
  fr: 'voir plus ici',
};

export default async function EtherIncomeGuide({ lang }: { lang: Lang }) {
  const L = (m: LocalizedText): string => lRec(m, lang) || m.en || '';
  const tpl = (m: LocalizedText, vars: Record<string, string | number>): string =>
    Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, String(v)), L(m));

  // --- Libellés de palier : nom du jeu si présent, sinon gabarit Top/Rank ------
  const tierLabel = (t: EtherRankTier, family: 'guild' | 'wb' | 'sing'): string => {
    if (t.name) return lRec(t.name, lang) || t.name.en;
    if (t.kind === 'rate') return tpl(LABELS.tierTopPct, { n: t.max });
    if (t.max >= 999999) return tpl(LABELS.tierBelow, { n: t.min });
    if (t.min === t.max && family === 'wb') return tpl(LABELS.tierRank, { n: t.min });
    return tpl(LABELS.tierTop, { n: t.min === t.max ? t.min : t.max });
  };
  const toOptions = (tiers: EtherRankTier[], family: 'guild' | 'wb' | 'sing'): LadderOption[] =>
    tiers.map((t) => ({ label: tierLabel(t, family), ether: t.ether }));

  // --- Défauts STRUCTURELS (un défaut introuvable = éditorial périmé, on jette) --
  const must = (idx: number, what: string): number => {
    if (idx < 0) throw new Error(`ether-income : palier par défaut introuvable — ${what}`);
    return idx;
  };
  const arenaOptions = RANKINGS.arena.map((t) => ({
    label: t.name ? lRec(t.name, lang) || t.name.en : String(t.min),
    ether: t.ether,
  }));
  const arenaDefault = must(
    RANKINGS.arena.findIndex((t) => t.name?.en === DEFAULTS.arenaNameEn),
    `arène « ${DEFAULTS.arenaNameEn} »`,
  );
  const guildDefault = must(
    RANKINGS.guildRaid.tiers.findIndex(
      (t) => t.min <= DEFAULTS.guildRaidRank && DEFAULTS.guildRaidRank <= t.max,
    ),
    `guild raid rang ${DEFAULTS.guildRaidRank}`,
  );
  const isWbDefaultTier = (t: EtherRankTier): boolean =>
    t.kind === DEFAULTS.worldBossTier.kind && t.max === DEFAULTS.worldBossTier.max;
  const leagues = RANKINGS.worldBoss.leagues.map((lg) => {
    const idx = lg.tiers.findIndex(isWbDefaultTier);
    return {
      name: lRec(lg.name, lang) || lg.name.en,
      options: toOptions(lg.tiers, 'wb'),
      defaultIdx: idx >= 0 ? idx : lg.tiers.length - 1,
    };
  });
  const leagueDefault = must(
    RANKINGS.worldBoss.leagues.findIndex((lg) => lg.level === DEFAULTS.worldBossLevel),
    `ligue world boss level ${DEFAULTS.worldBossLevel}`,
  );
  // Singularity : ordre pire → meilleur dans le sélecteur (comme la V2).
  const singTiers = [...RANKINGS.singularity].reverse();
  const singDefault = must(
    singTiers.findIndex(
      (t) => t.kind === DEFAULTS.singularityTier.kind && t.max === DEFAULTS.singularityTier.max,
    ),
    'singularity Top 100%',
  );

  // --- Notes : gabarits {min}/{max} remplis depuis les échelles générées -------
  const ethers = (tiers: EtherRankTier[]): number[] => tiers.map((t) => t.ether);
  const wbEthers = RANKINGS.worldBoss.leagues.flatMap((lg) => ethers(lg.tiers));
  const noteVars: Record<string, Record<string, string | number>> = {
    'weekly.arena': {
      min: Math.min(...ethers(RANKINGS.arena)),
      max: Math.max(...ethers(RANKINGS.arena)),
    },
    'monthly.guildRaid': {
      min: Math.min(...ethers(RANKINGS.guildRaid.tiers)),
      max: Math.max(...ethers(RANKINGS.guildRaid.tiers)),
    },
    'monthly.worldBoss': { min: Math.min(...wbEthers), max: Math.max(...wbEthers) },
  };
  const toRow = (s: EtherSource): SourceRow => {
    // Cadence bimestrielle (guild raid / world boss) : la note dédiée remplace
    // la note de rang V2 — fourchette + « affiché en moyenne mensuelle ».
    const note =
      s.monthsPerCycle !== undefined
        ? tpl(LABELS.everyOtherMonth, noteVars[s.id] ?? {})
        : SOURCE_NOTES[s.id]
          ? tpl(SOURCE_NOTES[s.id], noteVars[s.id] ?? {})
          : '–';
    return {
      id: s.id,
      label: L(SOURCE_LABELS[s.id]),
      note,
      amount: s.amount,
      ...(s.daysPerWeek !== undefined ? { daysPerWeek: s.daysPerWeek } : {}),
      ...(s.monthsPerCycle !== undefined ? { monthsPerCycle: s.monthsPerCycle } : {}),
      ...(s.ranked ? { ranked: s.ranked } : {}),
    };
  };

  const labelKeys = [
    'dailyIncome',
    'weeklyIncome',
    'monthlyIncome',
    'weeklyTotal',
    'monthlyTotal',
    'perDay',
    'advancedAdjustments',
    'arena',
    'guild',
    'worldBoss',
    'singularity',
    'tableDaily',
    'tableWeekly',
    'tableMonthly',
    'source',
    'daily',
    'weekly',
    'monthly',
    'weeklyApprox',
    'monthlyApprox',
    'monthlyApprox4',
    'notes',
    'dailySubtotal',
    'weeklySubtotal',
    'monthlySubtotal',
    'variableExcluded',
    'variableTitle',
    'projection',
    'endDate',
    'currentEther',
    'days',
    'weeks',
    'months',
    'fromDaily',
    'fromWeekly',
    'fromMonthly',
    'projectedTotal',
  ] as const;

  const model: CalculatorModel = {
    labels: Object.fromEntries(
      labelKeys.map((k) => [k, L(LABELS[k])]),
    ) as CalculatorModel['labels'],
    daily: DAILY_SOURCES.map(toRow),
    weekly: WEEKLY_SOURCES.map(toRow),
    monthly: MONTHLY_SOURCES.map(toRow),
    variable: VARIABLE_SOURCE_IDS.map((id) => ({
      text: L(VARIABLE_ITEMS[id]),
      ...(id === 'variable.coupons'
        ? { couponHref: localePath(lang, '/coupons'), couponLabel: L(COUPON_LINK_LABEL) }
        : {}),
    })),
    arena: { options: arenaOptions, defaultIdx: arenaDefault },
    guildRaid: { options: toOptions(RANKINGS.guildRaid.tiers, 'guild'), defaultIdx: guildDefault },
    worldBoss: { leagues, defaultLeagueIdx: leagueDefault },
    singularity: { options: toOptions(singTiers, 'sing'), defaultIdx: singDefault },
    etherIconSrc: itemChipByName('Ether', lang).iconSrc,
  };

  return (
    <>
      <Prose>{L(LABELS.intro)}</Prose>
      <EtherCalculator model={model} />
    </>
  );
}
