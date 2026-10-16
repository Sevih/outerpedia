/**
 * Les pages du jeu sur ses trois stores — source UNIQUE de ces URL : note
 * « Jouer à OUTERPLANE » de l'accueil, guide « How to play », guide Linux.
 * Les noms de stores ne se traduisent pas, les URL non plus.
 */
export const GAME_STORE_URLS = {
  steam: 'https://store.steampowered.com/app/4247320/OUTERPLANE/',
  playstore: 'https://play.google.com/store/apps/details?id=com.smilegate.outerplane.stove.google',
  appstore: 'https://apps.apple.com/us/app/outerplane-strategy-anime/id1630880836',
} as const;
