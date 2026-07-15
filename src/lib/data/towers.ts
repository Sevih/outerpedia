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
import type { Tower, TowersData } from '@contracts';

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
