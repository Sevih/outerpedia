/**
 * Générateur — CALENDRIER DES CONTENUS SAISONNIERS (`content-schedule.json`).
 * Construit UNIQUEMENT depuis les tables du jeu (exigence Sevih : pas de V2
 * comme modèle) : les trois modes tournants portent leurs FENÊTRES DE DATES
 * dans leur table — le « contenu actif » est donc 100 % factuel.
 *
 *   WorldBossTemplet           StartDate / RewardDate / AdjustEndDate / EndDate
 *   GuildRaidTemplet           StartDate / PhaseEndDate / RewardDate / EndDate
 *                              / RankingEndDate
 *   EventBossDungeonTemplet    StartDate / EndDate   (= joint challenge)
 *
 * PHASES DE SAISON — sémantique des colonnes FIGÉE par recoupement avec les
 * patch notes officielles (fournies par Sevih le 2026-07-11 ; WB Dahlia S4 et
 * guild raid S2_1 de juin 2026). On ne peut TAPER le boss que pendant la
 * première phase — « actif » côté app ne doit JAMAIS se réduire à
 * `start ≤ now < end` :
 *
 *   World Boss   StartDate → RewardDate    combat (« Season Period »)
 *                RewardDate → AdjustEndDate décompte (« Tally Period »)
 *                AdjustEndDate → EndDate    réclamation (« Reward Claim »)
 *   Guild Raid   StartDate → RewardDate    combat (« Period »)
 *                RewardDate → EndDate       règlement (« Settlement Period »)
 *                EndDate → (hors table)     récompenses (~7 j, borne absente)
 *                RankingEndDate             fin d'affichage du classement
 *                PhaseEndDate (start+2 j)   ABSENTE des notes — rôle inconnu,
 *                                           émise brute
 *
 * FUSEAU : bornes à 00:00 UTC (confirmé par les notes) → dates émises en ISO
 * `AAAA-MM-JJTHH:mm:ssZ`. Nuance : le début réel d'une saison est la FIN DE
 * MAINTENANCE du jour de `start` (« after maintenance »), pas 00:00.
 * Deux limites factuelles :
 *   - seules les fenêtres livrées avec le patch courant existent (la saison
 *     suivante apparaît avec sa maj → un trou au calendrier ≠ « plus jamais ») ;
 *   - les `BossID` de GuildRaidTemplet sont des ids LOGIQUES
 *     (GuildRaidGradeTemplet) : les monstres réels viennent toujours de la
 *     chaîne spawn des donjons de grade (cf. encounters).
 *
 * PV par palier, advantage rates et paliers de rang vivent déjà dans
 * `encounters.json` — ce fichier ne porte que l'axe TEMPS + les identités.
 */
import type { LangDict } from '../lib/lang';
import { isMain } from '../lib/is-main';
import { loadTextIndex, resolveText } from '../lib/text';
import { groupBy, indexBy, loadTable, num, splitCsv } from '../lib/tables';
import { spawnGroupIds, spawnUnits } from './encounters';

/** Une saison de World Boss. */
export interface WorldBossSeason {
  id: string;
  name: LangDict;
  /** Monstre boss affiché (id MonsterTemplet réel, colonne BossID). */
  boss?: string;
  /** Donjons des ligues de la saison (WorldBossLeagueTemplet, niveau croissant). */
  dungeons: string[];
  /** Monstres réellement spawnés dans ces donjons. */
  monsters: string[];
  /** Ouverture de la saison (jour de maintenance — le combat ouvre APRÈS elle). */
  start: string;
  /** Fin de la fenêtre de COMBAT = début du décompte (« Tally Period »). */
  battleEnd?: string;
  /** Fin du décompte = début de la réclamation (« Reward Claim Period »). */
  tallyEnd?: string;
  /** Fin de la réclamation — la saison disparaît. */
  end: string;
}

/** Un boss (main/sub) d'une saison de guild raid : 5 grades → 5 donjons. */
export interface GuildRaidBoss {
  /** Donjons par grade croissant (`BossDungeonID`). */
  dungeons: string[];
  /** Monstres spawnés (union des grades, dédupliquée). */
  monsters: string[];
}

/** Une saison de Guild Raid. */
export interface GuildRaidSeason {
  id: string;
  title: LangDict;
  /** Boss PRINCIPAL d'abord, puis les subs (cf. commentaire du générateur). */
  bosses: GuildRaidBoss[];
  /** Ouverture de la saison (jour de maintenance — le combat ouvre APRÈS elle). */
  start: string;
  /** Colonne `PhaseEndDate` (start+2 j) — rôle inconnu, absente des patch notes. */
  phaseEnd?: string;
  /** Fin de la fenêtre de COMBAT = début du règlement (« Settlement Period »). */
  battleEnd?: string;
  /** Fin du règlement = début de la période de récompenses (~7 j, borne de fin
   *  hors table). Dernière borne dure de la saison. */
  settlementEnd: string;
  /** Fin d'affichage du classement (bien après la saison). */
  rankingEnd?: string;
}

/** Une saison de Joint Challenge (EventBossDungeonTemplet). */
export interface JointChallengeSeason {
  id: string;
  name: LangDict;
  /**
   * Boss CANONIQUE affiché par la saison (colonne BossID) — PAS l'entité
   * combattue : chaque difficulté spawn sa VARIANTE (S04 : BossID 4548001
   * mais spawns 4548161/71/81 ; S02 2026 : BossID 4034005, spawns 4134045/55/65).
   * Toute jointure guide↔saison passe par `monsters`.
   */
  boss?: string;
  /** Donjons par difficulté croissante (normal/hard/very hard). */
  dungeons: string[];
  /** Entités réellement spawnées (chaîne spawn, alignées sur `dungeons`). */
  monsters: string[];
  /** Persos BONUS de la saison (`CharID` — ids CharacterTemplet). */
  bonusCharacters?: string[];
  /** Aucune colonne intermédiaire : la table ne découpe pas la saison en phases. */
  start: string;
  end: string;
}

/** `data/generated/content-schedule.json` — saisons triées par date de début. */
export interface ContentScheduleData {
  worldBoss: WorldBossSeason[];
  guildRaid: GuildRaidSeason[];
  jointChallenge: JointChallengeSeason[];
}

/** « 2026-07-02 0:00:00 » → « 2026-07-02T00:00:00Z » (fuseau UTC, cf. en-tête). */
function isoUtc(v: string | undefined): string {
  const raw = (v ?? '').trim();
  const m = /^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2}):(\d{2})$/.exec(raw);
  if (!m) {
    // Format inattendu → valeur rendue telle quelle, mais SIGNALÉE : le tri
    // (localeCompare) et le statut « en saison » (SeasonBadge) deviendraient
    // silencieusement faux. Jamais de throw — une ligne lacunaire n'invalide
    // pas le calendrier entier.
    if (raw)
      console.warn(
        `⚠ content-schedule : date inattendue « ${raw} » (attendu « AAAA-MM-JJ H:MM:SS »).`,
      );
    return raw;
  }
  return `${m[1]}T${m[2].padStart(2, '0')}:${m[3]}:${m[4]}Z`;
}

const byStart = (a: { start: string }, b: { start: string }): number =>
  a.start.localeCompare(b.start);

export function buildContentSchedule(): ContentScheduleData {
  const tsys = loadTextIndex('TextSystem');
  const dungeonById = indexBy(loadTable('DungeonTemplet'));
  const spawnsByGroup = groupBy(loadTable('DungeonSpawnTemplet'), 'GroupID');

  /** Monstres spawnés d'un donjon (dédupliqués, ordre des tables). */
  const monstersOf = (dungeonId: string, into: string[] = []): string[] => {
    const d = dungeonById.get(dungeonId);
    if (!d) return into;
    for (const g of spawnGroupIds(d)) {
      for (const mid of spawnUnits(spawnsByGroup.get(g) ?? [])) {
        if (!into.includes(mid)) into.push(mid);
      }
    }
    return into;
  };

  // --- World Boss : les donjons vivent sur les LIGUES de la saison. ---------
  const leaguesByBoss = groupBy(loadTable('WorldBossLeagueTemplet'), 'WorldBossID');
  const worldBoss: WorldBossSeason[] = loadTable('WorldBossTemplet').map((r) => {
    const leagues = (leaguesByBoss.get(r.ID ?? '') ?? []).sort(
      (a, b) => num(a.Level) - num(b.Level),
    );
    const dungeons: string[] = [];
    for (const l of leagues)
      if (l.DungeonID && !dungeons.includes(l.DungeonID)) dungeons.push(l.DungeonID);
    if (r.DungeonID && !dungeons.includes(r.DungeonID)) dungeons.push(r.DungeonID);
    const monsters: string[] = [];
    for (const did of dungeons) monstersOf(did, monsters);
    const season: WorldBossSeason = {
      id: r.ID,
      name: resolveText(tsys, r.Name),
      dungeons,
      monsters,
      start: isoUtc(r.StartDate),
      end: isoUtc(r.EndDate),
    };
    if (r.BossID) season.boss = r.BossID;
    if (r.RewardDate) season.battleEnd = isoUtc(r.RewardDate);
    if (r.AdjustEndDate) season.tallyEnd = isoUtc(r.AdjustEndDate);
    return season;
  });

  // --- Guild Raid : BossID logiques → lignes de grade → donjons → spawns. ---
  const gradeById = indexBy(loadTable('GuildRaidGradeTemplet'));
  const gradesByRaid = groupBy(loadTable('GuildRaidGradeTemplet'), 'GuildRaidID');
  const guildRaid: GuildRaidSeason[] = loadTable('GuildRaidTemplet').map((r) => {
    const bosses: GuildRaidBoss[] = [];
    // Le boss PRINCIPAL vit dans une colonne SANS EN-TÊTE de la table (le
    // parseur bytes la nomme `_unknown_0`) — vérifié : sa ligne de grade
    // pointe les donjons DM_GUILD_RAID_MAIN_BOSS (10 grades), alors que
    // `BossID` ne liste que les SUB (5 grades chacun).
    for (const logicalId of [...splitCsv(r._unknown_0), ...splitCsv(r.BossID)]) {
      const entry = gradeById.get(logicalId);
      if (!entry) {
        console.warn(`⚠ content-schedule : BossID ${logicalId} absent de GuildRaidGradeTemplet.`);
        continue;
      }
      // Toutes les lignes du même boss = même GroupID au sein de la saison.
      const grades = (gradesByRaid.get(entry.GuildRaidID ?? '') ?? [])
        .filter((g) => g.GroupID === entry.GroupID)
        .sort((a, b) => num(a.Grade) - num(b.Grade));
      const dungeons = grades.map((g) => g.BossDungeonID ?? '').filter(Boolean);
      const monsters: string[] = [];
      for (const did of dungeons) monstersOf(did, monsters);
      bosses.push({ dungeons, monsters });
    }
    const season: GuildRaidSeason = {
      id: r.ID,
      title: resolveText(tsys, r.TitleStr),
      bosses,
      start: isoUtc(r.StartDate),
      settlementEnd: isoUtc(r.EndDate),
    };
    if (r.PhaseEndDate) season.phaseEnd = isoUtc(r.PhaseEndDate);
    if (r.RewardDate) season.battleEnd = isoUtc(r.RewardDate);
    if (r.RankingEndDate) season.rankingEnd = isoUtc(r.RankingEndDate);
    return season;
  });

  // --- Joint Challenge : tout est sur la ligne de saison. -------------------
  const jointChallenge: JointChallengeSeason[] = loadTable('EventBossDungeonTemplet').map((r) => {
    const dungeons = splitCsv(r.DungeonID);
    const monsters: string[] = [];
    for (const did of dungeons) monstersOf(did, monsters);
    const season: JointChallengeSeason = {
      id: r.ID,
      name: resolveText(tsys, r.NameID),
      dungeons,
      monsters,
      start: isoUtc(r.StartDate),
      end: isoUtc(r.EndDate),
    };
    if (r.BossID) season.boss = r.BossID;
    const bonus = splitCsv(r.CharID);
    if (bonus.length) season.bonusCharacters = bonus;
    return season;
  });

  worldBoss.sort(byStart);
  guildRaid.sort(byStart);
  jointChallenge.sort(byStart);
  return { worldBoss, guildRaid, jointChallenge };
}

// Exécution directe.
if (isMain(import.meta.url)) {
  console.log(JSON.stringify(buildContentSchedule(), null, 2));
}
