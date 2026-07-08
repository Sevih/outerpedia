import type { GameVersion } from '@contracts';
import data from '@data/generated/game-version.json';

const VERSION = data as GameVersion;

/** Version de ressources du jeu (`resVersion`, ex. « 1.10.503 »). */
export function getGameVersion(): string {
  return VERSION.resVersion;
}
