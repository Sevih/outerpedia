/**
 * RÉORDONNANCEMENT d'une liste éditable — le geste « monter / descendre ».
 *
 * Écrit une première fois dans `EventsEditor` (`moveBlock`), il allait l'être une
 * seconde pour les priorités de pull. Deux copies d'un échange d'indices ne
 * divergent pas par hasard, elles divergent sur le CAS LIMITE : la première
 * ligne qui monte, la dernière qui descend. Une copie qui oublie la garde
 * `j < 0 || j >= length` fait disparaître un élément ou en duplique un autre,
 * et l'éditeur écrit ce résultat sans rien dire.
 *
 * Module PUR : aucune dépendance React, donc testable seul — c'est la moitié qui
 * porte la logique, les boutons ne font que l'appeler (cf. `MoveButtons`).
 */

/**
 * La liste avec l'élément `from` déplacé d'un cran dans `dir`. Rend la liste
 * D'ORIGINE (même référence) si le mouvement sort des bornes : l'appelant peut
 * donc appeler sans vérifier, et un `setState` inutile est évité par identité.
 */
export function moveItem<T>(list: readonly T[], from: number, dir: -1 | 1): T[] | readonly T[] {
  const to = from + dir;
  if (from < 0 || from >= list.length || to < 0 || to >= list.length) return list;
  const next = [...list];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}
