/**
 * Clé de l'onglet « Archivés » (assets retirés du jeu, toujours servis — cf.
 * rétention de catalogue de `promote`). Module SANS directive : partagé entre
 * le wrapper serveur (qui construit l'onglet) et la galerie cliente (qui
 * l'affiche). Une constante exportée d'un module `'use client'` n'est, côté
 * serveur, qu'une référence client — Next refuse de la lire.
 */
export const ARCHIVED = 'Archived';
