/**
 * Sources ÉDITORIALES de revenus d'Ether — montants verbatim V2 (data.ts).
 * Les montants réguliers (missions, packs, check-in…) sont des estimations
 * éditoriales ; les récompenses PAR RANG (arène, guild raid, world boss,
 * singularity) ne vivent PLUS ici : elles dérivent des tables du jeu
 * (data/generated/ether-rankings.json) — les valeurs V2 de guild raid et
 * world boss étaient d'ailleurs périmées (doublées par le jeu depuis).
 */

/** Les quatre familles dont le montant vient du palier de rang sélectionné. */
export type RankedFamily = 'arena' | 'guildRaid' | 'worldBoss' | 'singularity';

export interface EtherSource {
  id: string;
  /** Montant éditorial — pour les sources `ranked`, simple valeur de repli
   *  (le calculateur injecte le palier sélectionné). */
  amount: number;
  /** Jours actifs par semaine (sources daily seulement, défaut 7). */
  daysPerWeek?: number;
  /** Cadence en mois (sources monthly, défaut 1) : guild raid et world boss
   *  ALTERNENT, un mois sur deux (décision Sevih 18/07 — la V2 les comptait
   *  chaque mois). Les totaux moyennent (montant ÷ cadence). */
  monthsPerCycle?: number;
  ranked?: RankedFamily;
}

export const DAILY_SOURCES: EtherSource[] = [
  { id: 'daily.missions', amount: 50 },
  { id: 'daily.arena', amount: 20 },
  { id: 'daily.freePack', amount: 15 },
  { id: 'daily.missionEvent', amount: 30 },
  { id: 'daily.antiparticle', amount: 78 },
  { id: 'daily.singularityRanking', amount: 5, daysPerWeek: 4, ranked: 'singularity' },
];

export const WEEKLY_SOURCES: EtherSource[] = [
  { id: 'weekly.freePack', amount: 75 },
  { id: 'weekly.arena', amount: 400, ranked: 'arena' },
  { id: 'weekly.missions', amount: 150 },
  { id: 'weekly.guildCheckin', amount: 150 },
  { id: 'weekly.monadGate', amount: 250 },
];

export const MONTHLY_SOURCES: EtherSource[] = [
  { id: 'monthly.freePack', amount: 150 },
  { id: 'monthly.skywardTower', amount: 500 },
  { id: 'monthly.checkin', amount: 750 },
  { id: 'monthly.maintenance', amount: 400 },
  { id: 'monthly.jointMission', amount: 880 },
  { id: 'monthly.guildRaid', amount: 200, ranked: 'guildRaid', monthsPerCycle: 2 },
  { id: 'monthly.worldBoss', amount: 60, ranked: 'worldBoss', monthsPerCycle: 2 },
];

export const VARIABLE_SOURCE_IDS = [
  'variable.terminus',
  'variable.updateEvent',
  'variable.sideStories',
  'variable.coupons',
  'variable.seasonalEvents',
] as const;

/**
 * Paliers par défaut (le compte « moyen » de la V2) — désignés
 * STRUCTURELLEMENT, jamais par montant : les montants suivent le jeu.
 */
export const DEFAULTS = {
  /** Nom EN du palier d'arène (jeu) — introuvable = build cassé. */
  arenaNameEn: 'Diamond III',
  /** Palier guild raid contenant ce rang (Top 51–100). */
  guildRaidRank: 51,
  /** Ligue world boss (Level 4 = Extreme) + palier « Top 100% ». */
  worldBossLevel: 4,
  worldBossTier: { kind: 'rate' as const, max: 100 },
  /** Singularity : « Top 100% ». */
  singularityTier: { kind: 'rate' as const, max: 100 },
};
