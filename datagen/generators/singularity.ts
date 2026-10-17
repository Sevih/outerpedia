/**
 * Générateur — ROTATION du Dimensional Singularity / Monad Gate
 * (`singularity.json`). Construit UNIQUEMENT depuis les tables du jeu
 * (exigence Sevih : pas d'ancien code comme modèle), plus UNE donnée curée
 * irréductible : l'ancre calendaire.
 *
 * Tables :
 *   SingularityTemplet             6 groupes de rotation ; chacun porte thème
 *     (Name/Desc via TextSystem), jour de départ (`SingularityStartDOW`),
 *     durée de combat (`SingularityPeriodDate`, jours) et durée de récompense
 *     (`SingularityRewardDate`, jours). Le site suppose que combat +
 *     récompense font 7 jours (un groupe par semaine) : `singularityWarnings`
 *     le signale au build sinon.
 *   SingularityDungeonGroupTemplet GroupID → donjons ordonnés (`Order`), un
 *     par jour de combat, avec vignette/bannière du boss (sprites
 *     `MT_/T_Singularity_<modelId>`).
 *   DungeonTemplet → DungeonSpawnTemplet   boss RÉEL de chaque donjon : les
 *     donjons 750001xx spawnent des entités DÉDIÉES `600000xx`
 *     (CT_AREA_BOSS_MONSTER, kit Monad Gate propre, ModelID = boss source) —
 *     présentes dans monsters.json, on référence donc l'id spawné.
 *
 * CE QUE LES TABLES NE DISENT PAS : quel groupe est actif quelle semaine.
 * L'ancre (groupe G a démarré le AAAA-MM-JJ) est de la donnée CURÉE, constatée
 * en jeu → `data/curated/singularity.json`. La séquence appliquée ensuite est
 * l'ordre croissant des ids de groupe, cyclique. Le calcul « groupe du jour »
 * appartient à l'app (pure fonction de l'ancre et de la date) ; ce fichier
 * fournit les paramètres, pas un calendrier déroulé.
 *
 * Les paliers E…SSS (SingularityGradeTemplet) vivent déjà sur
 * `encounters.json` (`DungeonRef.ranks`) — pas dupliqués ici.
 */
import type { LangDict } from '../lib/lang';
import { slugEnum } from '../lib/enums';
import { isMain } from '../lib/is-main';
import { readCuratedJson } from '../lib/json';
import { loadTextIndex, resolveText } from '../lib/text';
import { groupBy, indexBy, loadTable, num } from '../lib/tables';
import { dungeonSpawnedMonsters } from './encounters';

/** Un combat de boss d'un groupe de rotation. */
export interface SingularityBoss {
  /** Position dans le groupe (à partir de 0, colonne `Order`). */
  order: number;
  /** DungeonID du combat (réf `encounters.json` : nom, paliers E…SSS). */
  dungeon: string;
  /** Monstres spawnés (entités `monsters.json` — kit dédié Monad Gate). */
  monsters: string[];
  /** Sprites de la table (vignette/bannière — nommés d'après le boss SOURCE). */
  thumbnail?: string;
  banner?: string;
}

/** Un groupe de la rotation (une semaine). */
export interface SingularityGroup {
  /** Id du groupe (`SingularityTemplet.ID`) — l'ordre de rotation. */
  id: number;
  /** Nom du thème (SYS_SINGULARITY_NAME_xx — identique entre groupes à ce jour). */
  name: LangDict;
  /** Description du thème (SYS_SINGULARITY_DESC_xx). */
  desc: LangDict;
  bosses: SingularityBoss[];
}

/** Ancre calendaire CURÉE (constatée en jeu, non dérivable des tables). */
export interface SingularityAnchor {
  /** Date locale serveur (AAAA-MM-JJ) du début de fenêtre du groupe `group`. */
  date: string;
  group: number;
}

/** Paramètres de rotation portés par les tables (+ ancre curée). */
export interface SingularitySchedule {
  /** Jour de départ de chaque fenêtre (slug de `SingularityStartDOW` : `wed`). */
  startDow: string;
  /** Jours de combat par fenêtre (`SingularityPeriodDate`). */
  battleDays: number;
  /** Jours de distribution/repos qui suivent (`SingularityRewardDate`). */
  rewardDays: number;
  /** Absente si `data/curated/singularity.json` manque (signalé au build). */
  anchor?: SingularityAnchor;
}

/** `data/generated/singularity.json` */
export interface SingularityData {
  schedule: SingularitySchedule;
  groups: SingularityGroup[];
}

const CURATED_PATH = 'data/curated/singularity.json';

/** Slugs JS des jours (index `Date.getUTCDay()`) — calendrier, pas du jeu. */
const JS_DOW = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/**
 * Lit et valide l'ancre curée ; problèmes SÉMANTIQUES signalés, jamais
 * bloquants (absent/invalide = sortie sans ancre). Un JSON CASSÉ, lui, jette
 * (readCuratedJson) : erreur de syntaxe = erreur humaine à corriger.
 */
function loadAnchor(groupIds: Set<number>, startDow: string): SingularityAnchor | undefined {
  const raw = readCuratedJson<{ anchor?: SingularityAnchor }>(CURATED_PATH);
  if (!raw) {
    console.warn(
      `⚠ ${CURATED_PATH} absent — singularity.json sortira SANS ancre ` +
        '(le calcul du groupe actif sera impossible côté app).',
    );
    return undefined;
  }
  const anchor = raw.anchor;
  if (!anchor || !/^\d{4}-\d{2}-\d{2}$/.test(anchor.date) || !groupIds.has(anchor.group)) {
    console.warn(`⚠ ${CURATED_PATH} : ancre invalide (date AAAA-MM-JJ + groupe existant).`);
    return undefined;
  }
  const dow = JS_DOW[new Date(`${anchor.date}T00:00:00Z`).getUTCDay()];
  if (dow !== startDow) {
    console.warn(
      `⚠ ${CURATED_PATH} : ${anchor.date} est un « ${dow} » mais la rotation ` +
        `démarre le « ${startDow} » (SingularityStartDOW) — ancre à re-vérifier en jeu.`,
    );
  }
  return anchor;
}

/**
 * Alertes de cadence d'une rotation : ce que les tables pourraient livrer et
 * que le site ne sait pas rendre fidèlement. Pure (testée sans `.gamedata`).
 *
 * - Un groupe a moins de boss que de jours de combat : le site fait tenir le
 *   DERNIER boss les jours restants (règle de la note de patch,
 *   `bossesByDay`), le client reboucle sur le PREMIER (jour modulo nombre de
 *   boss, `CTempletManager.GetSingularityDungeonGroupTemplet`). Les deux
 *   divergent alors : à trancher par une capture en jeu.
 * - Combat + récompense ≠ 7 jours : le site déroule une rotation par semaine
 *   (`% 7`, `/ 7`, `* 7` de `src/lib/data/singularity.ts`).
 */
export function singularityWarnings({
  schedule,
  groups,
}: Pick<SingularityData, 'schedule' | 'groups'>): string[] {
  const warnings: string[] = [];
  for (const g of groups)
    if (g.bosses.length && g.bosses.length < schedule.battleDays)
      warnings.push(
        `⚠ singularity : groupe ${g.id} à ${g.bosses.length} boss pour ${schedule.battleDays} ` +
          'jours de combat — le site fait tenir le dernier boss, le client reboucle sur le ' +
          'premier : à trancher par une capture en jeu.',
      );
  const cycle = schedule.battleDays + schedule.rewardDays;
  if (cycle !== 7)
    warnings.push(
      `⚠ singularity : cycle de ${cycle} jours (${schedule.battleDays} combat + ` +
        `${schedule.rewardDays} récompense) — le site suppose 7 jours ` +
        '(src/lib/data/singularity.ts : % 7, / 7, * 7).',
    );
  return warnings;
}

export function buildSingularity(): SingularityData {
  const tsys = loadTextIndex('TextSystem');
  const dungeonById = indexBy(loadTable('DungeonTemplet'));
  const spawnsByGroup = groupBy(loadTable('DungeonSpawnTemplet'), 'GroupID');
  const dungeonGroups = groupBy(loadTable('SingularityDungeonGroupTemplet'), 'GroupID');

  /** Monstres spawnés d'un donjon (traversée partagée — cf. encounters). */
  const monstersOf = (dungeonId: string): string[] =>
    dungeonSpawnedMonsters(dungeonById.get(dungeonId), spawnsByGroup);

  const groups: SingularityGroup[] = [];
  let startDow = '';
  let battleDays = 0;
  let rewardDays = 0;
  for (const r of loadTable('SingularityTemplet')) {
    // Paramètres de cadence : identiques sur les 6 lignes à ce jour — on
    // prend les premiers non vides et on signale toute divergence.
    const dow = slugEnum(r.SingularityStartDOW);
    if (!startDow) startDow = dow;
    else if (dow && dow !== startDow)
      console.warn(`⚠ singularity : StartDOW divergent sur le groupe ${r.ID} (${dow}).`);
    if (!battleDays) battleDays = num(r.SingularityPeriodDate);
    if (!rewardDays) rewardDays = num(r.SingularityRewardDate);

    const bosses: SingularityBoss[] = (dungeonGroups.get(r.SingularityDungeonGroupID ?? '') ?? [])
      .map((g) => {
        const boss: SingularityBoss = {
          order: num(g.Order),
          dungeon: g.DungeonID ?? '',
          monsters: monstersOf(g.DungeonID ?? ''),
        };
        if (g.BossThumbnail) boss.thumbnail = g.BossThumbnail;
        if (g.BossBanner) boss.banner = g.BossBanner;
        return boss;
      })
      .sort((a, b) => a.order - b.order);
    if (!bosses.length) console.warn(`⚠ singularity : groupe ${r.ID} sans donjons.`);
    for (const b of bosses)
      if (!b.monsters.length) console.warn(`⚠ singularity : donjon ${b.dungeon} sans spawn.`);

    groups.push({
      id: num(r.ID),
      name: resolveText(tsys, r.SingularityThemeName),
      desc: resolveText(tsys, r.SingularityThemeDesc),
      bosses,
    });
  }
  groups.sort((a, b) => a.id - b.id);

  const schedule: SingularitySchedule = { startDow, battleDays, rewardDays };
  const anchor = loadAnchor(new Set(groups.map((g) => g.id)), startDow);
  if (anchor) schedule.anchor = anchor;
  for (const w of singularityWarnings({ schedule, groups })) console.warn(w);
  return { schedule, groups };
}

// Exécution directe.
if (isMain(import.meta.url)) {
  console.log(JSON.stringify(buildSingularity(), null, 2));
}
