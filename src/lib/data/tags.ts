/**
 * VOCABULAIRE des étiquettes de personnage (`data/curated/tags.json`).
 *
 * Deux moitiés bien séparées, à ne pas confondre :
 *   - QUI porte quoi → l'EXTRACTION (`Character.tags`), dérivé des tables du
 *     jeu (bannière de recrutement, buffs de pénétration, lignée core-fusion) ;
 *     seul `free` vient du curé (`CharacterCurated.tags`) — aucun marqueur
 *     d'obtention gratuite n'existe dans les tables.
 *   - CE QUE ÇA VEUT DIRE → ce module. Le jeu ne fournit AUCUN texte pour ces
 *     catégories (ni `TextSystem`, ni `TextCharacter`) : le sens est éditorial.
 *
 * L'ordre d'affichage (`sort`) vit ici et NULLE PART ailleurs — les composants
 * ne redéclarent plus de liste ordonnée en dur.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Lang } from '@/lib/i18n/config';
import type { TagDef, TagGlossary, TagKind } from '@contracts';

const TAGS_PATH = resolve(process.cwd(), 'data/curated/tags.json');

let cache: TagGlossary | null = null;

/** Vocabulaire complet (slug → définition). Fichier absent → {} (dégradé propre). */
export function loadTagGlossary(): TagGlossary {
  cache ??= (() => {
    try {
      return JSON.parse(readFileSync(TAGS_PATH, 'utf8')) as TagGlossary;
    } catch {
      return {};
    }
  })();
  return cache;
}

/** Définition d'un tag, `undefined` hors vocabulaire. */
export function tagDef(slug: string): TagDef | undefined {
  return loadTagGlossary()[slug];
}

/** Libellé localisé (`premium` → « Premium Units »), repli EN puis slug. */
export function tagLabel(slug: string, lang: Lang): string {
  const def = tagDef(slug);
  return def?.name[lang] ?? def?.name.en ?? slug;
}

/** Description localisée (repli EN), `undefined` si le tag n'en a pas. */
export function tagDesc(slug: string, lang: Lang): string | undefined {
  const def = tagDef(slug);
  return def?.desc?.[lang] ?? def?.desc?.en;
}

/**
 * Trie par l'ordre canonique du vocabulaire. Un slug inconnu part en queue
 * plutôt que de casser le rendu (le test `tags.test.ts` est là pour qu'il
 * n'y en ait jamais).
 */
export function sortTags(tags: readonly string[]): string[] {
  const g = loadTagGlossary();
  return [...tags].sort((a, b) => (g[a]?.sort ?? 999) - (g[b]?.sort ?? 999));
}

/**
 * Premier tag d'une nature donnée, dans l'ordre canonique — un perso n'a qu'UN
 * badge de recrutement, même s'il cumulait plusieurs catégories.
 */
export function firstTagOfKind(tags: readonly string[], kind: TagKind): string | undefined {
  const g = loadTagGlossary();
  return sortTags(tags).find((t) => g[t]?.kind === kind);
}
