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
 *
 * RESTRICTIONS D'ÉQUIPE (bans/quotas d'élément, de classe, d'étoile) :
 * `DungeonPVEGroupTemplet` relie chaque `DungeonID` (= étage) à un
 * `TeamConditionGroupID` (CSV de GROUPES), chaque groupe étant l'ensemble des
 * lignes de `DungeonTeamConditionTemplet` partageant la même clé `_unknown_0`.
 *   - groupe SINGLETON (`_unknown_0 == ID`) → restriction FIXE de l'étage
 *     (hard, élémentaires — l'élémentaire porte ainsi son CONTRE-ÉLÉMENT requis,
 *     source de vérité du jeu, aucune map dérivée à maintenir) ;
 *   - groupe MULTI (`1001` = les 23 bans/quotas possibles) → MENU dans lequel le
 *     jeu tire UNE contrainte au hasard à chaque tentative (very hard) : propre
 *     au joueur, donc NON figé par étage → l'étage garde `restrictions: []` et
 *     `randomized: true`, le menu dédupliqué vit dans `Tower.restrictionsPool`.
 * `Count` : `-1` = interdiction (ban) ; `N` > 0 = quota requis. `ConditionDesc`
 * est déjà localisé (5 langues) → résolu par la primitive de texte partagée.
 */
import type { LangDict } from '../lib/lang';
import { slugEnum } from '../lib/enums';
import { isMain } from '../lib/is-main';
import { loadTextIndex, resolveText } from '../lib/text';
import { groupBy, indexBy, loadTable, num, splitCsv, type Row } from '../lib/tables';
import { spawnGroupIds } from './encounters';

/** Un monstre d'une vague (niveau RÉEL de la rencontre). */
export interface TowerUnit {
  id: string;
  level: number;
}

/**
 * Une ligne de groupe de spawn (`DungeonSpawnTemplet`) → une formation : les 4
 * slots `ID0..3`, chacun pouvant être un CSV de plusieurs monstres qui
 * PARTAGENT le `Level<i>` de leur slot. Pur (aucune table), cœur testable.
 */
export function formationOf(w: Row): TowerUnit[] {
  const units: TowerUnit[] = [];
  for (let i = 0; i < 4; i++) {
    for (const mid of splitCsv(w[`ID${i}`] ?? '')) {
      units.push({ id: mid, level: num(w[`Level${i}`]) });
    }
  }
  return units;
}

/**
 * Restriction d'équipe (source : `DungeonTeamConditionTemplet`), telle quelle,
 * sans jugement éditorial.
 */
export interface TowerRestriction {
  /** Nature de la contrainte : `element` | `class` | `star`. */
  type: string;
  /** Cible : élément (`fire`…), classe (`attacker`…) ou niveau d'étoile (`1`..`3`). */
  subType: string;
  /** `-1` = interdiction (ban) ; `N` > 0 = quota requis. */
  count: number;
  /** Libellé localisé fourni par le jeu (5 langues). */
  desc: LangDict;
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
  /**
   * Restrictions d'équipe FIXES de l'étage. TOUJOURS présent (`[]` explicite si
   * rien : tour normale, paliers boss). Les tours élémentaires y portent leur
   * contre-élément requis.
   */
  restrictions: TowerRestriction[];
  /**
   * Vrai si la restriction est TIRÉE AU HASARD dans `Tower.restrictionsPool`
   * (very hard) : `restrictions` reste `[]` (rien de figé). Absent (≡ false)
   * sinon.
   */
  randomized?: boolean;
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
  /**
   * VERY HARD uniquement — MENU de restrictions dans lequel le jeu tire UNE
   * contrainte au hasard à chaque tentative (propre au joueur, NON figé par
   * étage : cf. `TowerFloor.randomized`). Dédupliqué sur toute la tour. Usage
   * éditorial/disclaimer, jamais comme une restriction garantie.
   */
  restrictionsPool?: TowerRestriction[];
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

  // Restrictions d'équipe : DungeonID → groupe(s) de conditions, chaque groupe =
  // lignes partageant `_unknown_0` (singleton = fixe, multi = pool randomisé).
  const pveByDungeon = indexBy(loadTable('DungeonPVEGroupTemplet'), 'DungeonID');
  const condByGroup = groupBy(loadTable('DungeonTeamConditionTemplet'), '_unknown_0');

  /** Une ligne de condition → restriction typée. */
  const restrictionOf = (r: Row): TowerRestriction => ({
    type: slugEnum(r.ConditionType), // ELEMENT→element, CLASS→class, BASIC_STAR→star
    subType: slugEnum(r.ConditionSubType), // CET_FIRE→fire, CCT_ATTACKER→attacker, '2'→'2'
    count: num(r.Count),
    desc: resolveText(tsys, r.ConditionDesc),
  });

  // Pool de restrictions par tour (very hard), dédupliqué par type|subType|count.
  const poolByTower = new Map<string, Map<string, TowerRestriction>>();

  /** Restrictions FIXES d'un étage + drapeau `randomized` (alimente le pool). */
  const restrictionsOf = (
    dungeonId: string,
    key: string,
  ): Pick<TowerFloor, 'restrictions' | 'randomized'> => {
    const pve = pveByDungeon.get(dungeonId);
    const fixed: TowerRestriction[] = [];
    let randomized = false;
    for (const gid of splitCsv(pve?.TeamConditionGroupID ?? '')) {
      const rows = condByGroup.get(gid);
      if (!rows?.length) {
        console.warn(`⚠ towers : groupe de condition ${gid} introuvable (étage ${dungeonId}).`);
        continue;
      }
      if (rows.length > 1) {
        // Groupe multi = menu randomisé → au pool de la tour, pas à l'étage.
        randomized = true;
        let pool = poolByTower.get(key);
        if (!pool) poolByTower.set(key, (pool = new Map()));
        for (const r of rows) {
          const res = restrictionOf(r);
          const rk = `${res.type}|${res.subType}|${res.count}`;
          if (!pool.has(rk)) pool.set(rk, res);
        }
      } else {
        fixed.push(restrictionOf(rows[0]));
      }
    }
    return randomized ? { restrictions: fixed, randomized: true } : { restrictions: fixed };
  };

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
      ...restrictionsOf(d.ID, key),
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
    // Menu de restrictions randomisées (very hard) — dédupliqué.
    const pool = poolByTower.get(key);
    if (pool?.size) tower.restrictionsPool = [...pool.values()];
  }
  return towers;
}

// Exécution directe.
if (isMain(import.meta.url)) {
  const towers = buildTowers();
  for (const [k, t] of Object.entries(towers)) {
    const restricted = t.floors.filter((f) => f.restrictions.length).length;
    const random = t.floors.filter((f) => f.randomized).length;
    const bits = [`${t.floors.length} étages`];
    if (t.days) bits.push(`jours ${t.days.join(',')}`);
    if (restricted) bits.push(`${restricted} avec restriction fixe`);
    if (random) bits.push(`${random} randomisés (pool ${t.restrictionsPool?.length ?? 0})`);
    console.log(`${k}: ${bits.join(' — ')}`);
  }
}
