/**
 * Colonnes de LANGUE masquées du TABLEAU d'une table brute du jeu (tables
 * `Text*`) : seule la colonne anglaise se lit — les autres ne font qu'écraser
 * la largeur. La ligne brute garde toutes les langues, et la recherche par
 * colonne aussi (le sélecteur liste les colonnes complètes). Dérivé de
 * `LANG_COLUMNS` (plus `China_Traditional`, que le jeu porte sans qu'on la
 * serve) : la liste recopiée dans le composant avait laissé passer French et
 * Spanish le 23/09/2026.
 *
 * Module PUR (ni disque ni `node:fs`) : le composant client de l'admin
 * (`GameDataBrowser`) et l'onglet « Tables du jeu » de quick lisent la même
 * règle — `gamedata-store.ts`, lui, tire `node:fs` et ne s'importe pas côté
 * client.
 */
import { LANG_COLUMNS } from '@datagen/lib/lang';

export const HIDDEN_LANG_COLUMNS: ReadonlySet<string> = new Set([
  ...Object.values(LANG_COLUMNS).filter((c) => c !== 'English'),
  'China_Traditional',
]);
