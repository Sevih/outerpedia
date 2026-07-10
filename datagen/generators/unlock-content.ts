/**
 * Générateur — CONDITIONS DE DÉBLOCAGE des contenus (`unlock-content.json`).
 *
 * Sert le guide « Unlocking Content » : pour chaque `ContentType` verrouillé
 * (ContentLockTemplet), résout le nom joueur du mode et les stages requis.
 * Port TS du script Python V2 (oracle), réduit aux champs réellement consommés.
 *
 *   ContentLockTemplet.UnLockConditionValue → DungeonTemplet (stage + nom)
 *     → AreaTemplet (saison/épisode pour le libellé de stage, marqueur Hard)
 *   TextSystem["SYS_CONTENS_LOCK_<CT>"]     → lockScreenName (nom PRIMAIRE)
 *   ContentLockTemplet.TextID               → officialName   (repli)
 *
 * Libellé de stage : « S<saison>[H]-<épisode>-<stage> ». La saison est le
 * numéro JOUEUR : le jeu découpe une saison en plusieurs SeasonID internes à
 * numérotation d'épisodes CONTINUE (S2 = épisodes 1-5 puis 6-10 sur deux ids) ;
 * seule une remise à 1 des épisodes ouvre une nouvelle saison affichée.
 *
 * ⚠ Les IDs de donjons mentent parfois (réorganisés entre saisons au fil des
 * patchs) : toujours passer par AreaID, jamais parser l'ID.
 */
import type { LangDict } from '../lib/lang';
import { loadTextIndex, resolveText } from '../lib/text';
import { indexBy, loadTable, num, splitCsv, type Row } from '../lib/tables';

/** Un stage requis pour débloquer un contenu. */
export interface UnlockRequirement {
  /** Libellé joueur « S1H-2-3 » — absent si non dérivable des tables. */
  stage?: string;
  /** Nom localisé du donjon. */
  dungeonName?: LangDict;
  /** Région/chapitre (AreaTemplet), si résolue. */
  areaName?: LangDict;
}

/** Une entrée de ContentLockTemplet, résolue. */
export interface UnlockEntry {
  contentType: string;
  /** Nom affiché sur l'écran de verrouillage (source la plus fiable). */
  lockScreenName?: LangDict;
  /** Nom officiel (TextID) — repli quand le lock-screen manque. */
  officialName?: LangDict;
  /** Stages requis (conditions `DUNGEON_CLAER` — sic, typo du jeu). */
  requirements: UnlockRequirement[];
}

/** `data/generated/unlock-content.json` */
export interface UnlockContentData {
  entries: UnlockEntry[];
}

/**
 * Overrides de clé TextSystem pour le nom lock-screen : par défaut on lit
 * `SYS_CONTENS_LOCK_<CT>`, mais quelques ContentTypes n'ont pas cette entrée
 * ou pointent un libellé PÉRIMÉ (ancien nom du mode). Corrections de source de
 * données — pas de l'éditorial (qui vit dans le guide).
 */
const LOCK_SCREEN_OVERRIDES: Record<string, string> = {
  // Pas d'entrée SYS_CONTENS_LOCK_* ; clés de titre dédiées.
  SINGULARITY: 'SYS_SINGULARITY_MAIN_TITLE',
  CHARACTER_FUSION: 'SYS_CHARACTER_FUSION_TITLE',
  // SYS_CONTENS_LOCK_* périmé / faux / plus rare en jeu — la clé actuelle :
  PVE_EXP_DUNGEON: 'SYS_GOLD_DUNGEON', // « Bandit Pursuit » → « Hypnotic Frog Hall »
  PVE_REMAINS: 'SYS_SHORTCUT_REMAINS_TYPE_01',
  PVE_REMAINS_LOOP: 'SYS_SHORTCUT_REMAINS_TYPE_02',
  PVE_EXPLORATION: 'SYS_RUIN_ISLAND', // → « Terminus Isle »
  PIECE_DUNGEON: 'SYS_PIECE_DUNGEON',
  IRREGULAR_INFILTRATE: 'SYS_IRR_INFILTREATE_NAME_01',
  IRREGULAR_CHASE: 'SYS_IRR_CHASE_NAME_01',
  AGIT_CUSTOM_CRAFT: 'SYS_CRAFT_DETAILS_TITLE', // → « Precise Craft »
  EVENT_DUNGEON: 'SYS_MENU_EVENT_DUNGEON', // « Event Story » → « Event Dungeon »
};

/** Dict tout-vide → undefined (donnée absente, pas une valeur). */
function nonEmpty(d: LangDict): LangDict | undefined {
  return Object.values(d).some(Boolean) ? d : undefined;
}

/** SeasonID interne → numéro de saison JOUEUR (cf. en-tête). */
function buildSeasonDisplayMap(areas: Row[]): Map<number, number> {
  const minEp = new Map<number, number>();
  for (const a of areas) {
    const season = num(a.SeasonID);
    const episode = num(a.EpisodeNum);
    if (!season || !episode) continue;
    const cur = minEp.get(season);
    if (cur === undefined || episode < cur) minEp.set(season, episode);
  }
  const display = new Map<number, number>();
  let counter = 0;
  for (const [i, season] of [...minEp.keys()].sort((a, b) => a - b).entries()) {
    // La première saison ouvre toujours la n°1 ; ensuite seul un redémarrage
    // des épisodes à 1 avance le numéro affiché (sinon = « Part 2 »).
    if (i === 0 || minEp.get(season) === 1) counter++;
    display.set(season, counter);
  }
  return display;
}

export function buildUnlockContent(): UnlockContentData {
  const tsys = loadTextIndex('TextSystem');
  const locks = loadTable('ContentLockTemplet');
  const dungeonById = indexBy(loadTable('DungeonTemplet'));
  const areas = loadTable('AreaTemplet');
  const areaById = indexBy(areas);
  // Les zones Hard portent ShortName `SYS_HARD_AREA*` (Normal : `SYS_AREA*`).
  const hardAreas = new Set(
    areas.filter((a) => (a.ShortName ?? '').startsWith('SYS_HARD_AREA')).map((a) => a.ID),
  );
  const seasonDisplay = buildSeasonDisplayMap(areas);

  const stageLabel = (dungeonId: string, dungeon: Row): string | undefined => {
    if (!/^\d{2,}$/.test(dungeonId)) return undefined;
    const area = areaById.get(dungeon.AreaID ?? '');
    if (!area) return undefined;
    const season = num(area.SeasonID);
    const episode = num(area.EpisodeNum);
    if (!season || !episode) return undefined;
    const stage = num(dungeonId.slice(-2));
    const hard = hardAreas.has(dungeon.AreaID) ? 'H' : '';
    return `S${seasonDisplay.get(season) ?? season}${hard}-${episode}-${stage}`;
  };

  const resolveDungeon = (dungeonId: string): UnlockRequirement => {
    const dungeon = dungeonById.get(dungeonId);
    if (!dungeon) return {};
    const out: UnlockRequirement = {};
    const stage = stageLabel(dungeonId, dungeon);
    if (stage) out.stage = stage;
    const name = nonEmpty(resolveText(tsys, dungeon.NameID));
    if (name) out.dungeonName = name;
    const area = areaById.get(dungeon.AreaID ?? '');
    const areaName = area ? nonEmpty(resolveText(tsys, area.NameID)) : undefined;
    if (areaName) out.areaName = areaName;
    return out;
  };

  const entries: UnlockEntry[] = [];
  for (const row of locks) {
    const contentType = row.ContentType;
    if (!contentType) continue;
    const lockScreenKey = LOCK_SCREEN_OVERRIDES[contentType] ?? `SYS_CONTENS_LOCK_${contentType}`;
    const entry: UnlockEntry = { contentType, requirements: [] };
    const lockScreenName = nonEmpty(resolveText(tsys, lockScreenKey));
    if (lockScreenName) entry.lockScreenName = lockScreenName;
    const officialName =
      row.TextID && row.TextID !== '0' ? nonEmpty(resolveText(tsys, row.TextID)) : undefined;
    if (officialName) entry.officialName = officialName;
    // Conditions donjon (CSV possible : « 111007, 121511, 122010 »).
    if (row.UnLockConditionType === 'DUNGEON_CLAER' && row.UnLockConditionValue) {
      entry.requirements = splitCsv(row.UnLockConditionValue).map(resolveDungeon);
    }
    entries.push(entry);
  }

  // Tri stable pour des diffs propres.
  entries.sort((a, b) => a.contentType.localeCompare(b.contentType));
  return { entries };
}

// Exécution directe.
if (process.argv[1] && process.argv[1].endsWith('unlock-content.ts')) {
  console.log(JSON.stringify(buildUnlockContent(), null, 2));
}
