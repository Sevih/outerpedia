/**
 * Accès aux DATES DE SORTIE des persos (`data/generated/character-release.json`).
 *
 * Contrat minimal `id → "YYYY-MM-DD"` (cf. `datagen/generators/character-release`) :
 * le tri de `/characters` et le bloc `meta` de la fiche sont les deux seuls
 * consommateurs. Donnée générée → import statique figé (même choix que
 * `characters.ts` / `recruit.ts`).
 *
 * Le générateur GARANTIT une date par perso intégré — l'optionnel ci-dessous ne
 * couvre que le perso pas encore promu (le jeu embarque ceux des patchs à venir).
 */
import type { CharacterReleaseFile } from '@contracts';
import releaseData from '@data/generated/character-release.json';
import { LANGUAGES, type Lang } from '@/lib/i18n/config';

const RELEASES = releaseData as CharacterReleaseFile;

/** Jour de sortie ISO d'un perso (`2026-08-12`). */
export function releaseDateOf(id: string): string | undefined {
  return RELEASES[id];
}

/** `2026-08-12` → « August 12, 2026 », « 12 août 2026 », « 2026年8月12日 »… */
export function formatReleaseDate(iso: string, lang: Lang): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(LANGUAGES[lang].htmlLang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
