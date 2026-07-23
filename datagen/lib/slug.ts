/**
 * Slugs de personnage (URLs) — dérivés du NOM D'AFFICHAGE anglais.
 *
 * Reprend l'algorithme V2 (minuscule, sans diacritiques ni apostrophes, tirets),
 * avec suffixes de collision `-2`, `-3`… Déterministe (tri par id) pour un diff
 * git stable. Le slug est lang-agnostique (toujours EN), comme en prod.
 */
import type { LangDict } from './lang';

type NameLike = {
  id: string;
  name: LangDict;
  nickname?: LangDict;
  showNickName?: boolean;
  originalCharacter?: string;
};

/** « Monad Iota » -> « monad-iota ». */
export function toSlug(fullname: string): string {
  return fullname
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // diacritiques
    .replace(/['’]/g, '') // apostrophes (droite + typographique)
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Nom d'affichage EN (surnom en préfixe si `showNickName`). */
export function displayNameEn(c: NameLike): string {
  return c.showNickName && c.nickname ? `${c.nickname.en} ${c.name.en}` : c.name.en;
}

/** Carte slug -> id, avec suffixes de collision, déterministe. */
export function buildSlugMap(chars: NameLike[]): Record<string, string> {
  const out: Record<string, string> = {};
  const seen = new Map<string, number>();
  for (const c of [...chars].sort((a, b) => a.id.localeCompare(b.id))) {
    // Une core-fusion (`originalCharacter` posé) est une entité SÉPARÉE portant
    // le MÊME nom que sa base → sans préfixe, elle héritait d'un suffixe de
    // collision (`notia-2`) au lieu de l'URL canonique V2 `core-fusion-notia`.
    // Préfixe FIGÉ, pas dérivé du libellé localisé FusionTitle : un slug est une
    // URL stable, indépendante de la langue.
    const base = c.originalCharacter
      ? `core-fusion-${toSlug(c.name.en)}`
      : toSlug(displayNameEn(c));
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    out[n === 1 ? base : `${base}-${n}`] = c.id;
  }
  return out;
}
