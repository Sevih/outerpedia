/**
 * Classement des correspondances du catalogue d'items — PARTAGÉ par le picker
 * de l'admin (`ItemPicker`) et l'outil `quick`, qui cherchaient chacun de leur
 * côté et n'ont pas à diverger : le défaut corrigé ici s'est reproduit tel quel
 * dans le second, sur le même item.
 *
 * Trier par PERTINENCE, pas par ordre de catalogue : sans ça, une monnaie au
 * nom court (« Gold ») est noyée sous les vingt coffres qui la CONTIENNENT
 * (« Gold & Stamina Chest », « Antiparticle Gold Chest - Level 1 »…) et tombe
 * hors de la liste — la correspondance exacte est la dernière servie, donc la
 * seule introuvable.
 */

/** Rang : nom exact > commence par > contient. */
function rank(name: string, q: string): number {
  const n = name.toLowerCase();
  if (n === q) return 0;
  if (n.startsWith(q)) return 1;
  return 2;
}

/**
 * Les options dont le nom contient `query`, les plus pertinentes d'abord (à
 * rang égal, le nom le plus court), plafonnées à `limit`.
 */
export function rankItemMatches<T extends { name: string }>(
  options: T[],
  query: string,
  limit = 20,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return options
    .filter((o) => o.name.toLowerCase().includes(q))
    .sort((a, b) => rank(a.name, q) - rank(b.name, q) || a.name.length - b.name.length)
    .slice(0, limit);
}
