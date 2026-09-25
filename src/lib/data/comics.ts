/**
 * Accès à la copie COMMITTÉE du catalogue des 4-cut comics
 * (`data/generated/comics.json`) — le repli de l'outil quand le manifeste R2
 * n'est pas joignable.
 */
import type { ComicsData } from '@datagen/generators/comics';
import comicsData from '@data/generated/comics.json';

const COMICS = comicsData as ComicsData;

export function getCommittedComics(): ComicsData {
  return COMICS;
}
