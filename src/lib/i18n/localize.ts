import type { Lang } from './config';

/**
 * Lit une valeur localisée avec repli anglais.
 *
 * Le texte est stocké en OBJET (`LangDict` = toutes les langues du jeu côté
 * données, `LocalizedText` = partiel côté curé et éditorial) — un seul helper
 * suffit, pas de format suffixe. Le repli sert aux curés et libellés éditoriaux
 * pas encore traduits (l'espagnol au lancement, 23/09/2026).
 *
 * Une chaîne VIDE replie aussi (`||`, plus `??`) : une entité retenue après son
 * retrait du jeu (`retired`, cf. promote) garde un dict complété à vide pour les
 * langues apparues depuis — un blanc à l'écran n'est pas une traduction, l'anglais
 * en est une. Le jeu remplissant toutes ses colonnes, aucune donnée vivante ne
 * porte de vide « voulu ».
 */
export function lRec(map: Partial<Record<string, string>> | undefined, lang: Lang): string {
  if (!map) return '';
  return map[lang] || map.en || '';
}
