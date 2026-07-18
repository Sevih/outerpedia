/**
 * Clés React STABLES pour les listes éditables admin.
 *
 * Problème : keyer une ligne par son index (`key={i}`) casse dès qu'on supprime
 * une ligne du milieu — React réconcilie par position, donc l'état INTERNE des
 * enfants (query d'un CharacterPicker/ItemPicker, dropdown ouvert, focus) est
 * transféré à la ligne suivante au lieu d'être détruit avec la ligne supprimée.
 *
 * Solution : une clé synthétique attribuée À LA CRÉATION de la ligne (chargement
 * initial ET ajout), jamais dérivée de la donnée (l'id métier peut être vide ou
 * dupliqué tant que l'utilisateur saisit). `_key` reste purement présentationnel
 * et doit être RETIRÉ avant sérialisation (les `build()`/`toMap()`/`toPromo()`
 * des éditeurs reconstruisent déjà la forme métier sans lui).
 *
 * `crypto.randomUUID` exige un contexte sécurisé : OK ici (admin = dev-only sur
 * localhost, contexte sécurisé) et côté Node au SSR. La clé n'apparaissant pas
 * dans le DOM, une valeur différente serveur/client ne cause aucun mismatch
 * d'hydratation.
 */
export type Keyed<T> = T & { _key: string };

/** Nouvelle clé de ligne (à l'ajout d'une ligne vierge). */
export const rowKey = (): string => crypto.randomUUID();

/** Décore une ligne existante d'une clé stable (chargement initial). */
export const withKey = <T extends object>(value: T): Keyed<T> => ({ ...value, _key: rowKey() });

/**
 * Retire `_key` avant sérialisation, quand la ligne est envoyée telle quelle
 * (spread `...g`) plutôt que reconstruite champ par champ. Utile là où `_key`
 * fuirait dans le payload OU fausserait un filtre (`Object.values` verrait la
 * clé comme du contenu).
 */
export const stripKey = <T>(row: Keyed<T>): T => {
  const clean = { ...row };
  delete (clean as { _key?: string })._key;
  return clean;
};
