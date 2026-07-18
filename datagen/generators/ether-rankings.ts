/**
 * Générateur — ETHER PAR CLASSEMENT (`ether-rankings.json`).
 *
 * Sert le guide « Ether Income » : les quatre échelles de récompenses d'Ether
 * par rang que la V2 codait en dur (et dont deux étaient PÉRIMÉES — le jeu a
 * doublé le guild raid et le world boss depuis).
 *
 *   arena       — PVPRankTemplet : récompense de SAISON (hebdomadaire) par
 *                 palier de points/rang, nom officiel (SYS_PVP_RANK_*).
 *   guildRaid   — GuildRaidRankingRewardTemplet du raid le PLUS RÉCENT.
 *   worldBoss   — saison courante (WorldBossTemplet, StartDate max) → ses 4
 *                 ligues (WorldBossLeagueTemplet, noms officiels) → classement
 *                 GLOBAL_WORLD (c'est lui qui paie l'Ether ; MY_WORLD paie
 *                 titres/cadres/tickets).
 *   singularity — SingularityRankingTemplet du SingularityID le plus récent
 *                 (classement quotidien, mer–sam).
 *
 * L'Ether est la colonne `Crystal` de RewardTemplet (vérifié : arène top 1 =
 * 1500, singularity top 1 = 50 — les valeurs V2 à l'identique).
 */
import type { LangDict } from '../lib/lang';
import { isMain } from '../lib/is-main';
import { loadTextIndex, resolveText } from '../lib/text';
import { loadTable, num, type Row } from '../lib/tables';

/** Un palier de classement et son Ether. */
export interface EtherRankTier {
  /** `rank` = rang absolu (Min–Max), `rate` = pourcentage (Top {max}%). */
  kind: 'rank' | 'rate';
  min: number;
  max: number;
  ether: number;
  /** Nom officiel du palier (arène) ou de la ligue — absent si le jeu n'en a pas. */
  name?: LangDict;
}

export interface EtherRankingsData {
  /** Ordre pire → meilleur (l'ordre du sélecteur). */
  arena: EtherRankTier[];
  guildRaid: { raidId: string; tiers: EtherRankTier[] };
  worldBoss: {
    seasonId: string;
    leagues: { level: number; name: LangDict; tiers: EtherRankTier[] }[];
  };
  singularity: EtherRankTier[];
}

export function buildEtherRankings(): EtherRankingsData {
  const tsys = loadTextIndex('TextSystem');
  const rewards = new Map(loadTable('RewardTemplet').map((r) => [r.ID, r]));
  const etherOf = (rewardId: string, where: string): number => {
    const ether = num(rewards.get(rewardId)?.Crystal);
    if (ether <= 0) {
      throw new Error(`ether-rankings : ${where} — reward ${rewardId} sans Crystal`);
    }
    return ether;
  };
  const tierOf = (r: Row, where: string): EtherRankTier => ({
    kind: r.RankType === 'RATE' ? 'rate' : 'rank',
    min: num(r.Min),
    max: num(r.Max),
    ether: etherOf(r.RewardID, where),
  });
  /** rank d'abord (Min croissant), puis rate (Max croissant) — meilleur → pire. */
  const byRank = (a: EtherRankTier, b: EtherRankTier) =>
    a.kind === b.kind
      ? a.kind === 'rank'
        ? a.min - b.min
        : a.max - b.max
      : a.kind === 'rank'
        ? -1
        : 1;

  // --- Arène : récompense de saison par palier, pire → meilleur -----------------
  const arena = loadTable('PVPRankTemplet')
    .map((r) => ({
      kind: 'rank' as const,
      min: num(r.Min),
      max: num(r.Max),
      ether: etherOf(r.SeasonRewardID, 'arena'),
      name: resolveText(tsys, r.Name),
    }))
    .sort((a, b) => a.ether - b.ether);
  if (!arena.length) throw new Error('ether-rankings : PVPRankTemplet vide');

  // --- Guild raid : le raid le plus récent --------------------------------------
  const raids = loadTable('GuildRaidRankingRewardTemplet');
  const raidId = String(Math.max(...raids.map((r) => num(r.GuildRaidID))));
  const guildTiers = raids
    .filter((r) => r.GuildRaidID === raidId)
    .map((r) => tierOf(r, `guild raid ${raidId}`))
    .sort(byRank);
  if (!guildTiers.length) throw new Error(`ether-rankings : raid ${raidId} sans paliers`);

  // --- World boss : saison courante → 4 ligues → classement GLOBAL --------------
  const seasons = loadTable('WorldBossTemplet').sort((a, b) =>
    (a.StartDate ?? '').localeCompare(b.StartDate ?? ''),
  );
  const season = seasons[seasons.length - 1];
  if (!season) throw new Error('ether-rankings : WorldBossTemplet vide');
  const ranking = loadTable('WorldBossRankingTemplet');
  const leagues = loadTable('WorldBossLeagueTemplet')
    .filter((l) => l.WorldBossID === season.ID)
    .sort((a, b) => num(a.Level) - num(b.Level))
    .map((l) => {
      const tiers = ranking
        .filter((r) => r.WorldBossLeagueID === l.ID && r.RewardWorldType === 'GLOBAL_WORLD')
        .map((r) => tierOf(r, `world boss ligue ${l.ID}`))
        .sort(byRank);
      if (!tiers.length) {
        throw new Error(`ether-rankings : ligue ${l.ID} sans classement GLOBAL_WORLD`);
      }
      return { level: num(l.Level), name: resolveText(tsys, l.LeagueName), tiers };
    });
  if (!leagues.length) throw new Error(`ether-rankings : saison ${season.ID} sans ligues`);

  // --- Singularity : le classement quotidien le plus récent ---------------------
  const sing = loadTable('SingularityRankingTemplet');
  const singId = String(Math.max(...sing.map((r) => num(r.SingularityID))));
  const singularity = sing
    .filter((r) => r.SingularityID === singId)
    .map((r) => tierOf(r, `singularity ${singId}`))
    .sort(byRank);
  if (!singularity.length) throw new Error(`ether-rankings : singularity ${singId} vide`);

  return {
    arena,
    guildRaid: { raidId, tiers: guildTiers },
    worldBoss: { seasonId: season.ID, leagues },
    singularity,
  };
}

// Exécution directe.
if (isMain(import.meta.url)) {
  console.log(JSON.stringify(buildEtherRankings(), null, 2));
}
