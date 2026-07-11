/**
 * BADGES DE PALIER (`CM_Event_Rank_*`) — sprite dérivé du NOM du palier.
 *
 * Le jeu nomme ses paliers `E`, `E+`, `E++`, `D`, … `SSS`, `SSS+`, `SSS++` et
 * ses sprites `CM_Event_Rank_<BASE>` / `_01` (« + ») / `_02` (« ++ »). Les deux
 * séries sont en bijection (30 paliers ↔ 30 sprites, vérifié par test).
 *
 * Oui, c'est une dérivation depuis une chaîne — le travers qu'on reproche à la
 * V2. La différence : ici la chaîne EST l'identifiant canonique du palier
 * (`RankName` de la table), le sprite n'existe sous aucun autre nom, et un
 * palier qui ne mapperait pas fait ÉCHOUER le test. La V2, elle, décodait de la
 * donnée métier (élément, difficulté) depuis des noms de fichiers — ça, non.
 */

/** Sprite du badge d'un palier (`E++` → `CM_Event_Rank_E_02`). */
export function rankBadgeSprite(rankName: string): string {
  const plus = (rankName.match(/\+/g) ?? []).length;
  const base = rankName.replace(/\+/g, '');
  return `CM_Event_Rank_${base}${plus ? `_0${plus}` : ''}`;
}
