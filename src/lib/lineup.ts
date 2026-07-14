/**
 * COMMENT RANGER LES MONSTRES D'UN COMBAT — la règle, seule et testable.
 *
 * Le rendu vit dans `MonsterLineup` ; la DÉCISION vit ici, parce que c'est elle
 * qui peut pourrir en silence. Elle ne connaît ni React ni le DOM : elle prend
 * qui se bat, et dit comment les poser.
 *
 * UNE règle, appliquée à chaque groupe de rôle — pas un cas par mode :
 *
 *   1 monstre  → `solo`    : pleine largeur ;
 *   2 monstres → `pair`    : CÔTE À CÔTE (les deux phases d'un world boss se
 *                            comparent d'un coup d'œil — c'est ce que faisait la V2) ;
 *   3 et plus  → `compact` : vignettes + une seule carte dépliée (le rendu des
 *                            renforts des tours élémentaires en V2).
 *
 * Les BOSS d'abord, les RENFORTS ensuite : un combat se lit par ce qu'on vient y
 * affronter, pas par l'ordre où le jeu pose ses sprites sur le terrain (il les
 * range par POSITION — le K de Monad Eva est à gauche de son boss, donc listé
 * avant lui, et la page s'ouvrait sur l'escorte).
 *
 * La donnée porte des rencontres jusqu'à 12 boss et 23 renforts (Skyward Tower
 * Very Hard) : une règle qui n'énumère pas les cas est la seule qui tiendra
 * quand ces modes arriveront.
 */

/** Ce qu'une rangée fait de ses monstres. */
export type RowMode = 'solo' | 'pair' | 'compact';

/** Le minimum dont la règle a besoin — le reste (carte, icône) ne la regarde pas. */
export interface LineupEntry {
  role: 'boss' | 'add';
  /**
   * Sélections de combat où ce monstre est PRÉSENT (modes à stages, où une carte
   * fusionnée couvre plusieurs stages). Absent = présent, point.
   */
  indexes?: number[];
}

export interface LineupRow<T> {
  role: 'boss' | 'add';
  mode: RowMode;
  items: T[];
}

export function rowMode(count: number): RowMode {
  if (count <= 1) return 'solo';
  if (count === 2) return 'pair';
  return 'compact';
}

/**
 * Les rangées d'un combat, dans l'ordre où on les lit.
 *
 * `selected` : le stage courant d'un mode à stages — les monstres qui n'y sont
 * pas sont ÉCARTÉS (leur carte existe, elle ne vaut simplement pas pour ce
 * stage). `undefined` = pas de mode à stages : tout le monde est là.
 *
 * Une rangée vide n'est pas rendue : un combat sans renfort n'annonce pas une
 * section de renforts.
 */
export function lineupRows<T extends LineupEntry>(items: T[], selected?: number): LineupRow<T>[] {
  const here = items.filter(
    (i) => !i.indexes || selected === undefined || i.indexes.includes(selected),
  );
  const rows: LineupRow<T>[] = [];
  for (const role of ['boss', 'add'] as const) {
    const group = here.filter((i) => (role === 'add' ? i.role === 'add' : i.role !== 'add'));
    if (group.length) rows.push({ role, mode: rowMode(group.length), items: group });
  }
  return rows;
}
