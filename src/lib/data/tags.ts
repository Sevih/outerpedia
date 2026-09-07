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
import { loadCuratedJson } from '@/lib/data/disk';
import type { Lang } from '@/lib/i18n/config';
import type { TagDef, TagGlossary, TagGroup, TagKind } from '@contracts';

/**
 * Vocabulaire complet (slug → définition). Fichier absent → {} ; JSON cassé →
 * lève. Cache mtime de `disk.ts` (l'ancien cache permanent rendait une édition
 * admin de `tags.json` invisible jusqu'au redémarrage).
 */
export function loadTagGlossary(): TagGlossary {
  return loadCuratedJson<TagGlossary>('curated/tags.json', {});
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

/**
 * Les tags d'une FAMILLE, dans l'ordre canonique — `limited` rend
 * `['festival', 'seasonal', 'collab']`.
 *
 * Le point de la fonction : ces trois-là ne sont un groupe que pour le JOUEUR
 * (« ça ne revient pas »), le jeu, lui, ne connaît que trois bannières
 * distinctes. Tant que le groupe n'était écrit nulle part, quatre modules le
 * recopiaient en dur sous le nom `LIMITED_TAGS` — une liste dont le premier
 * élément s'appelait, lui aussi, `limited`. Une quatrième bannière limitée
 * demandait alors quatre éditions ; elle n'en demande plus qu'une, dans
 * `data/curated/tags.json`.
 */
export function tagsInGroup(group: TagGroup): string[] {
  const g = loadTagGlossary();
  return sortTags(Object.keys(g).filter((t) => g[t]?.group === group));
}

/** Le perso relève-t-il de la famille ? (au moins un de ses tags y appartient) */
export function hasTagInGroup(tags: readonly string[], group: TagGroup): boolean {
  const g = loadTagGlossary();
  return tags.some((t) => g[t]?.group === group);
}
