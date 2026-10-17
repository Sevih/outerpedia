/**
 * Primitive — les FORMES DE COMBAT d'un perso, telles que le jeu les déclare.
 *
 * `CharacterChangeTemplet` liste les transformations (`ChangeCharacterID`) : en
 * combat, le jeu REMPLACE le perso par sa forme (`CTeam`, `CDungeonScene`) — Demiurge
 * Luna 2000119 ↔ 2000120 sur son S2, Demiurge Saeran 2000129 → 2000130 à sa mort.
 * Le kit de la forme est donc celui que le joueur joue : trois lecteurs le
 * ramènent à la fiche de la base, avec la MÊME correspondance :
 *   - le spec perso (`extractor/specs/character.ts`) : les skills de la forme
 *     rejoignent la fiche ;
 *   - `kit-scaling.ts` et `generators/damage-scaling.ts` : les stats qui pilotent
 *     les dégâts se lisent sur la base ET ses formes.
 *
 * Deux faits des tables, gardés par les tests :
 *   - la transformation est déclarée aussi pour les SKINS (2010119 → 2010120) :
 *     la source se ramène toujours à l'identité de sa base (son `NameID`) ;
 *   - le jeu écrit des changements ALLER-RETOUR (2000120 → 2000119) : la cible
 *     du « retour » est la base elle-même (identité propre), pas une forme.
 */
import { loadTable, type Row } from './tables';

/**
 * Identité propre : le `NameID` d'une ligne est `<ID>_Name`. Les apparences
 * (skins) empruntent au contraire le `NameID` de leur base (`2000005_Name` sur
 * l'id `2010005`) → c'est ce qui les distingue d'un vrai perso/évolution.
 */
export function ownIdentity(r: Row): boolean {
  return r.NameID === `${r.ID}_Name`;
}

/**
 * Base → lignes `CharacterTemplet` de ses formes, dans l'ordre de la table, sans
 * doublon. PUR (testable sans tables). Une ligne absente de `CharacterTemplet`
 * (source ou cible) ne compte pas.
 */
export function formsByBaseFrom(characterRows: Row[], changeRows: Row[]): Map<string, Row[]> {
  const rowById = new Map(characterRows.map((r) => [r.ID, r]));
  const out = new Map<string, Row[]>();
  for (const chg of changeRows) {
    const source = rowById.get(chg.ID);
    const form = rowById.get(chg.ChangeCharacterID);
    if (!source || !form || ownIdentity(form)) continue;
    const baseId = ownIdentity(source) ? source.ID : source.NameID.replace(/_Name$/, '');
    const list = out.get(baseId) ?? [];
    if (!list.some((r) => r.ID === form.ID)) list.push(form);
    out.set(baseId, list);
  }
  return out;
}

/** `formsByBaseFrom` sur les tables du jeu. */
export function loadFormsByBase(): Map<string, Row[]> {
  return formsByBaseFrom(loadTable('CharacterTemplet'), loadTable('CharacterChangeTemplet'));
}
