/**
 * Générateur — COMPOSITIONS DES TOURS (`towers.json`). Construit UNIQUEMENT
 * depuis les tables du jeu (exigence Sevih : pas de V2 comme modèle).
 *
 * Huit tours dans DungeonTemplet, repérées par `DungeonMode` :
 *   DM_TOWER            Skyward Tower, 100 étages ;
 *   DM_TOWER_HARD       40 étages ;
 *   DM_TOWER_VERY_HARD  20 étages ;
 *   DM_TOWER_ELEMENT    5 tours de 100 étages, une par élément.
 *
 * L'élément d'une tour élémentaire n'est PAS une colonne du donjon : il se lit
 * dans le token du `NameID` (`SYS_INFINITE_DUNGEON_FIRE_01`), confronté aux
 * éléments déclarés par TowerElementalConfigTemplet (`DSM_FIRE`…) — aucun
 * mapping en dur. La même table donne les JOURS D'OUVERTURE par élément et le
 * texte du debuff de tour.
 *
 * Composition d'un étage = la chaîne spawn universelle (cf. encounters) :
 * `SpawnID_Pos0..2` (CSV possible !) → DungeonSpawnTemplet, monstres
 * `ID0..3`/`Level0..3`. DEUX régimes, discriminés par la FORME des groupes
 * (constaté en jeu par Sevih, confirmé sur les 660 étages — aucun mixte) :
 *   - groupes à UNE ligne chacun → `waves`, formations jouées À LA SUITE
 *     (normale/hard/élémentaires, 1 à 6 vagues) ;
 *   - UN SEUL groupe multi-lignes → `encounters`, formations ALTERNATIVES
 *     dont le jeu tire UNE au hasard à chaque tentative (very hard : pools
 *     de 2 à 12 par étage).
 * Le numéro d'étage vient du suffixe numérique du `NameID` (« Skyward Tower
 * 31F ») — jamais de l'ID de donjon (les ids mentent, cf. unlock-content).
 *
 * Noms de stages, région et advantage rates vivent déjà dans
 * `encounters.json` (mêmes DungeonID) — pas dupliqués ici.
 */
import type { LangDict } from '../lib/lang';
import { slugEnum } from '../lib/enums';
import { loadTextIndex, resolveText } from '../lib/text';
import { groupBy, loadTable, num, splitCsv, type Row } from '../lib/tables';
import { spawnGroupIds } from './encounters';

/** Un monstre d'une vague (niveau RÉEL de la rencontre). */
export interface TowerUnit {
  id: string;
  level: number;
}

/** Un étage de tour. */
export interface TowerFloor {
  /** Numéro d'étage joueur (suffixe du NameID : « …31F »). */
  floor: number;
  /** DungeonID (réf `encounters.json` : nom localisé, adv…). */
  dungeon: string;
  /** Puissance recommandée (`RecommendBattlePower`). */
  power?: number;
  /** Niveau recommandé (`RecommandLevel` — typo du jeu). */
  level?: number;
  /** Vagues SUCCESSIVES du combat, dans l'ordre des tables. */
  waves?: TowerUnit[][];
  /** Formations ALTERNATIVES — le jeu en tire UNE au hasard (very hard). */
  encounters?: TowerUnit[][];
}

/** Debuff des tours élémentaires (TowerElementalConfigTemplet). */
export interface TowerDebuff {
  title: LangDict;
  tooltip: LangDict;
  desc: LangDict;
  /** Ids de buff appliqués (`bid_element_debuff_1`…). */
  buffs: string[];
}

/** Une tour complète. */
export interface Tower {
  /** Slug du mode (`tower`, `tower_hard`, `tower_very_hard`, `tower_element`). */
  mode: string;
  /** Élément (`fire`…), tours élémentaires uniquement. */
  element?: string;
  /** Jours d'ouverture (slugs `sun`/`mon`/…), tours élémentaires uniquement. */
  days?: string[];
  /** Debuff de tour, tours élémentaires uniquement. */
  debuff?: TowerDebuff;
  floors: TowerFloor[];
}

/**
 * `data/generated/towers.json` — clé : `tower`, `tower_hard`,
 * `tower_very_hard`, `tower_element_fire` … `tower_element_dark`.
 */
export type TowersData = Record<string, Tower>;

export function buildTowers(): TowersData {
  const tsys = loadTextIndex('TextSystem');
  const spawnsByGroup = groupBy(loadTable('DungeonSpawnTemplet'), 'GroupID');

  // Config élémentaire : élément (DSM_*) → jours + debuff.
  const elemConfig = new Map<string, { days: string[]; debuff: TowerDebuff }>();
  for (const r of loadTable('TowerElementalConfigTemplet')) {
    const element = slugEnum(r.DungeonSubMode);
    if (!element) continue;
    elemConfig.set(element, {
      days: splitCsv(r.DayOfWeek).map((d) => slugEnum(d)),
      debuff: {
        title: resolveText(tsys, r.TitleText),
        tooltip: resolveText(tsys, r.ToolTipText),
        desc: resolveText(tsys, r.BuffDescription),
        buffs: splitCsv(r.BuffID),
      },
    });
  }

  /** Élément d'un donjon élémentaire, lu dans le token du NameID. */
  const elementOf = (nameId: string): string | undefined => {
    const up = (nameId ?? '').toUpperCase();
    for (const el of elemConfig.keys()) if (up.includes(`_${el.toUpperCase()}_`)) return el;
    return undefined;
  };

  /** Une ligne de groupe de spawn → une formation. */
  const formationOf = (w: Row): TowerUnit[] => {
    const units: TowerUnit[] = [];
    for (let i = 0; i < 4; i++) {
      for (const mid of splitCsv(w[`ID${i}`] ?? '')) {
        units.push({ id: mid, level: num(w[`Level${i}`]) });
      }
    }
    return units;
  };

  /** Composition d'un étage — `waves` OU `encounters` selon la forme (cf. en-tête). */
  const compositionOf = (d: Row): Pick<TowerFloor, 'waves' | 'encounters'> => {
    const groups = spawnGroupIds(d).map((g) => spawnsByGroup.get(g) ?? []);
    const formations = groups
      .flat()
      .map(formationOf)
      .filter((f) => f.length);
    if (groups.some((rows) => rows.length > 1)) {
      if (groups.length > 1)
        console.warn(`⚠ towers : ${d.ID} mélange vagues et pool aléatoire — modèle à revoir.`);
      return { encounters: formations };
    }
    return { waves: formations };
  };

  const towers: TowersData = {};
  for (const d of loadTable('DungeonTemplet')) {
    const mode = slugEnum(d.DungeonMode);
    if (!mode.startsWith('tower')) continue;

    let key = mode;
    let element: string | undefined;
    if (mode === 'tower_element') {
      element = elementOf(d.NameID ?? '');
      if (!element) {
        console.warn(`⚠ towers : élément introuvable pour ${d.ID} (${d.NameID}).`);
        continue;
      }
      key = `${mode}_${element}`;
    }

    let tower = towers[key];
    if (!tower) {
      tower = { mode, floors: [] };
      if (element) {
        tower.element = element;
        const cfg = elemConfig.get(element);
        if (cfg) {
          tower.days = cfg.days;
          tower.debuff = cfg.debuff;
        }
      }
      towers[key] = tower;
    }

    const floorMatch = /(\d+)\s*$/.exec(d.NameID ?? '');
    if (!floorMatch) console.warn(`⚠ towers : étage sans numéro pour ${d.ID} (${d.NameID}).`);
    const floor: TowerFloor = {
      floor: floorMatch ? num(floorMatch[1]) : tower.floors.length + 1,
      dungeon: d.ID,
      ...compositionOf(d),
    };
    if (num(d.RecommendBattlePower)) floor.power = num(d.RecommendBattlePower);
    if (num(d.RecommandLevel)) floor.level = num(d.RecommandLevel);
    if (!floor.waves?.length && !floor.encounters?.length)
      console.warn(`⚠ towers : étage ${d.ID} sans composition.`);
    tower.floors.push(floor);
  }

  for (const [key, tower] of Object.entries(towers)) {
    tower.floors.sort((a, b) => a.floor - b.floor);
    // Étages en double ou manquants = signal de dérive du parsing des NameID.
    const nums = tower.floors.map((f) => f.floor);
    if (new Set(nums).size !== nums.length) console.warn(`⚠ towers : étages en double (${key}).`);
  }
  return towers;
}

// Exécution directe.
if (process.argv[1] && process.argv[1].endsWith('towers.ts')) {
  const towers = buildTowers();
  for (const [k, t] of Object.entries(towers)) {
    console.log(`${k}: ${t.floors.length} étages${t.days ? ` — jours ${t.days.join(',')}` : ''}`);
  }
}
