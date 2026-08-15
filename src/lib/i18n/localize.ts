import type { Lang } from './config';

/**
 * Lit une valeur localisée avec repli anglais.
 *
 * Le texte est stocké en OBJET (`LangDict` = { en, jp, kr, zh } côté données,
 * `LocalizedText` = partiel + fr côté curé) — un seul helper suffit, pas de
 * format suffixe, inchangé.
 */
export function lRec(map: Partial<Record<string, string>> | undefined, lang: Lang): string {
  if (!map) return '';
  return map[lang] ?? map.en ?? '';
}
