/**
 * LES TOURS (Skyward Tower) — accès à `data/generated/towers.json`.
 *
 * Une tour est soit une tour de DIFFICULTÉ (`tower` / `tower_hard` /
 * `tower_very_hard`), soit une tour ÉLÉMENTAIRE (`tower_element`, qui porte
 * alors `element` + son debuff + les jours du débuff, `debuffDays` — pas ses
 * jours d'ouverture, que les tables ne donnent pas). Un guide de la
 * catégorie `skyward-tower` DÉSIGNE sa tour par sa clé (`meta.tower`) — la vue
 * en tire la section (difficulté / élémentaire), l'élément et l'ordre, là où la
 * tout ça se lisait dans le SLUG du guide (`fire-tower`, `normal-tower`).
 */
import towersData from '@data/generated/towers.json';
import type {
  DungeonAdv,
  Tower,
  TowerFloor,
  TowerRestriction,
  TowerUnit,
  TowersData,
} from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import type { SpawnContext } from '@/lib/monster-stats';
import { getEncounter } from './encounters';
import { getMonster } from './monsters';

const TOWERS = towersData as unknown as TowersData;

/** Clés de tour, dans l'ordre du jeu : difficultés croissantes puis éléments. */
export const TOWER_KEYS = Object.keys(TOWERS);

/** Garde de type : la clé désigne-t-elle une tour connue ? */
export function isTowerKey(key: string): boolean {
  return Object.hasOwn(TOWERS, key);
}

/** Une tour par sa clé (`undefined` si inconnue). */
export function getTower(key: string): Tower | undefined {
  return TOWERS[key];
}

/**
 * Modes de tour de DIFFICULTÉ, du plus facile au plus dur — l'ordre du jeu, qui
 * ne se lit dans aucun champ (les trois tours ne portent que leur `mode`). Sert
 * à ranger la section difficulté et à savoir ce qui n'est PAS élémentaire.
 */
export const TOWER_DIFFICULTY_MODES = ['tower', 'tower_hard', 'tower_very_hard'] as const;

/** Mode élémentaire (les cinq tours à élément partagent ce `mode`). */
export const TOWER_ELEMENT_MODE = 'tower_element';

/** Un étage d'une tour par son numéro joueur (`undefined` si hors bornes). */
export function getTowerFloor(tower: Tower, floor: number): TowerFloor | undefined {
  return tower.floors.find((f) => f.floor === floor);
}

/**
 * Contexte de spawn d'une unité d'un étage STANDARD : son niveau, et
 * l'adversité (`adv`) du donjon de l'étage — sans elle, les stats affichées
 * ignoraient les −76 % d'ATK du normal ou la SPD positive des élémentaires.
 */
export function towerFloorSpawn(floor: TowerFloor, level: number): SpawnContext {
  return { level, adv: getEncounter(floor.dungeon)?.adv };
}

/**
 * Libellé LOCALISÉ d'une restriction, gabarit résolu.
 *
 * `desc` est un gabarit du jeu (`« {0} Water hero(es) must be deployed »`) où
 * `{0}` est le quota. Deux formes :
 *   - QUOTA (`count > 0`) : on interpole `{0}` = count.
 *   - BAN (`count === -1`) : pas de `{0}`, la phrase se suffit.
 * Le jeu fournit le libellé dans ses six langues (`fr` et `es` compris depuis
 * que le client les livre) ; le repli sur l'anglais ne joue que si une langue
 * manque.
 */
export function formatRestriction(r: TowerRestriction, lang: Lang): string {
  const desc = r.desc as Record<string, string | undefined>;
  const template = desc[lang] ?? r.desc.en;
  return r.count > 0 ? template.replace('{0}', String(r.count)) : template;
}

/* ── Very hard : les COMBATS (une formation = un boss + ses adds) ── */

/**
 * Groupe d'un combat very hard, dans l'ordre du menu du jeu :
 *   - `floor20`  : l'étage 20 (Sigma / Iota) ;
 *   - `demiurge` : les étages fixes 5/10/15 (les trois Demiurges) ;
 *   - `random`   : le pool tiré au hasard sur tous les autres étages.
 */
export type TowerCombatGroup = 'floor20' | 'demiurge' | 'random';

const COMBAT_GROUP_ORDER: TowerCombatGroup[] = ['floor20', 'demiurge', 'random'];

/**
 * Un étage où un combat very hard peut tomber : chaque étage a son NIVEAU
 * (`RecommandLevel`, porté par les unités de la formation) et l'ADVERSITÉ de
 * son donjon (`adv`, pour-mille signés) — les stats du combat en dépendent.
 */
export interface TowerCombatFloor {
  floor: number;
  level: number;
  adv?: DungeonAdv;
}

/** Un combat very hard : le boss (unité `type:boss`), ses adds, et ses étages. */
export interface TowerCombat {
  group: TowerCombatGroup;
  /** Le boss (unité `type:boss`) — son `id` identifie le combat (segment d'URL). */
  boss: TowerUnit;
  /** Les autres unités de la formation (`type:monster`). */
  adds: TowerUnit[];
  /** Les étages où le combat apparaît, dans l'ordre des étages. */
  floors: TowerCombatFloor[];
}

/** Types de monstre qui tiennent le rôle de BOSS d'une formation.
 * PAS le même set que `BOSS_BADGE_TYPES` (admin/monster-icon) : le badge admin
 * inclut `season_boss`, qui ne mène jamais une formation de tour. */
const FORMATION_BOSS_TYPES = new Set(['boss', 'area_boss']);

/**
 * Les combats d'une tour very hard, dérivés des FORMATIONS de ses étages.
 *
 * Chaque `floor.encounters[i]` est une formation, et le jeu y marque exactement
 * une unité `type:boss` — c'est LE boss du combat, les autres sont ses adds.
 * Un combat = PLUSIEURS étages : les étages 5/10/15 rejouent les mêmes trois
 * Demiurges, les étages aléatoires piochent dans un même pool. On déduplique
 * donc par boss (le groupe et les adds sont ceux du premier étage), mais chaque
 * étage où le combat tombe est gardé, avec son niveau et l'`adv` de son donjon :
 * en jeu, les stats d'un combat changent selon l'étage où on le tire. Les pools
 * se lisent dans la donnée, rien n'est recomposé ici. Rangés par groupe.
 */
export function getTowerCombats(tower: Tower): TowerCombat[] {
  const seen = new Map<string, TowerCombat>();
  for (const floor of tower.floors) {
    const group: TowerCombatGroup = floor.randomized
      ? 'random'
      : floor.floor === 20
        ? 'floor20'
        : 'demiurge';
    for (const formation of floor.encounters ?? []) {
      const boss = formation.find((u) => {
        const type = getMonster(u.id)?.type;
        return type != null && FORMATION_BOSS_TYPES.has(type);
      });
      if (!boss) continue;
      const at: TowerCombatFloor = {
        floor: floor.floor,
        level: boss.level,
        adv: getEncounter(floor.dungeon)?.adv,
      };
      const known = seen.get(boss.id);
      if (known) {
        known.floors.push(at);
        continue;
      }
      seen.set(boss.id, {
        group,
        boss,
        adds: formation.filter((u) => u.id !== boss.id),
        floors: [at],
      });
    }
  }
  return [...seen.values()].sort(
    (a, b) => COMBAT_GROUP_ORDER.indexOf(a.group) - COMBAT_GROUP_ORDER.indexOf(b.group),
  );
}

/**
 * Les contextes de spawn d'un combat very hard : UN par étage où il apparaît,
 * dans l'ordre des étages (niveau de l'étage, `adv` de son donjon). Toutes les
 * unités d'une formation very hard partagent le niveau de l'étage
 * (`RecommandLevel`) : boss et adds reçoivent la même échelle.
 */
export function towerCombatSpawns(combat: TowerCombat): SpawnContext[] {
  return combat.floors.map((f) => ({ level: f.level, adv: f.adv }));
}
