/**
 * LES TOURS (Skyward Tower) — accès à `data/generated/towers.json`.
 *
 * Une tour est soit une tour de DIFFICULTÉ (`tower` / `tower_hard` /
 * `tower_very_hard`), soit une tour ÉLÉMENTAIRE (`tower_element`, qui porte
 * alors `element` + son debuff + ses jours d'ouverture). Un guide de la
 * catégorie `skyward-tower` DÉSIGNE sa tour par sa clé (`meta.tower`) — la vue
 * en tire la section (difficulté / élémentaire), l'élément et l'ordre, là où la
 * V2 lisait tout ça dans le SLUG du guide (`fire-tower`, `normal-tower`).
 */
import towersData from '@data/generated/towers.json';
import type { Tower, TowerFloor, TowerRestriction, TowerUnit, TowersData } from '@contracts';
import type { Lang } from '@/lib/i18n/config';
import { getMonster } from './monsters';

const TOWERS = towersData as unknown as TowersData;

/** Clés de tour, dans l'ordre du jeu : difficultés croissantes puis éléments. */
export const TOWER_KEYS = Object.keys(TOWERS);

/** Garde de type : la clé désigne-t-elle une tour connue ? */
export function isTowerKey(key: string): boolean {
  return key in TOWERS;
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
 * Libellé LOCALISÉ d'une restriction, gabarit résolu.
 *
 * `desc` est un gabarit du jeu (`« {0} Water hero(es) must be deployed »`) où
 * `{0}` est le quota. Deux formes :
 *   - QUOTA (`count > 0`) : on interpole `{0}` = count.
 *   - BAN (`count === -1`) : pas de `{0}`, la phrase se suffit.
 * Le jeu ne fournit que `en/jp/kr/zh` — le français retombe sur l'anglais
 * (décision de portage : le desc n'a pas de `fr`, cf. tower-guides-port).
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

/** Un combat very hard : le boss (unité `type:boss`) et ses adds. */
export interface TowerCombat {
  group: TowerCombatGroup;
  /** Le boss (unité `type:boss`) — son `id` identifie le combat (segment d'URL). */
  boss: TowerUnit;
  /** Les autres unités de la formation (`type:monster`). */
  adds: TowerUnit[];
}

/**
 * Les combats d'une tour very hard, dérivés des FORMATIONS de ses étages.
 *
 * Chaque `floor.encounters[i]` est une formation, et le jeu y marque exactement
 * une unité `type:boss` — c'est LE boss du combat, les autres sont ses adds.
 * On déduplique par boss (les étages 5/10/15 rejouent les mêmes trois Demiurges,
 * les étages aléatoires piochent dans le même pool) et on range par groupe.
 */
/** Types de monstre qui tiennent le rôle de BOSS d'une formation. */
const BOSS_TYPES = new Set(['boss', 'area_boss']);

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
        return type != null && BOSS_TYPES.has(type);
      });
      if (!boss || seen.has(boss.id)) continue;
      seen.set(boss.id, {
        group,
        boss,
        adds: formation.filter((u) => u.id !== boss.id),
      });
    }
  }
  return [...seen.values()].sort(
    (a, b) => COMBAT_GROUP_ORDER.indexOf(a.group) - COMBAT_GROUP_ORDER.indexOf(b.group),
  );
}

/** Un combat very hard par l'id de son boss (`undefined` si inconnu). */
export function getTowerCombat(tower: Tower, bossId: string): TowerCombat | undefined {
  return getTowerCombats(tower).find((c) => c.boss.id === bossId);
}
