/** Accès au catalogue des FONDS D'ÉCRAN (`data/generated/wallpapers.json`, catégorie → images). */
import type { WallpapersData } from '@datagen/generators/wallpapers';
import wallpapersData from '@data/generated/wallpapers.json';

const WALLPAPERS = wallpapersData as WallpapersData;

export function getWallpapers(): WallpapersData {
  return WALLPAPERS;
}
