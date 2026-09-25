/**
 * Accès au GLOSSAIRE du jeu (`data/generated/glossaries.json` : classes,
 * éléments, effets, statuts, cadeaux, geas…).
 *
 * UN SEUL MODE DE CHARGEMENT : l'import statique. Le fichier était aussi lu au
 * DISQUE (`loadDataJson`) par `monsters.ts`, `skill-view.ts` et
 * `admin/inline-refs.ts`, pour qu'un « Enregistrer » de l'extracteur (qui
 * réécrit `.effects`) ne recompile pas les routes. Ce détour ne protégeait de
 * rien : ces trois modules importent `effects.ts`, qui l'importe statiquement
 * comme une dizaine d'autres lecteurs de `src/lib/data` — le fichier est de
 * toute façon dans le graphe de modules, et le disque n'ajoutait qu'une SECONDE
 * copie parsée qui pouvait diverger de la première le temps d'un save.
 * L'inverse (tout au disque) est exclu : `game-tokens` et les outils le lisent
 * dans des modules qui n'ont pas droit à `node:fs`.
 *
 * Poids : 1,8 Mo — un composant `use client` qui le touche l'emporte dans le
 * bundle navigateur (cf. `stat-glossary.ts`).
 */
import type { Glossaries } from '@contracts';
import glossariesData from '@data/generated/glossaries.json';

const GLOSSARIES = glossariesData as unknown as Glossaries;

export function getGlossaries(): Glossaries {
  return GLOSSARIES;
}
