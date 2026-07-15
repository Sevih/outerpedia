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
import type { Tower, TowerFloor, TowerRestriction, TowersData } from '@contracts';
import type { Lang } from '@/lib/i18n/config';

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
