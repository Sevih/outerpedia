/**
 * Primitive — les IMMUNITÉS d'un combattant, monstre (`MonsterTemplet`) ou perso
 * (`CharacterTemplet`).
 *
 * Les trois colonnes (`BuffImmune`, `StatBuffImmune`, `BuffImmuneToolTip`)
 * existent dans les deux templets et le client les lit pour tout combattant
 * (`CCharacterData.IsImmune` / `IsImmuneStat`) : une seule lecture, partagée par
 * les specs monstre et perso.
 */
import { loadTable, splitCsv, type Row } from './tables';

/** Les trois colonnes d'immunité d'une ligne de templet (monstre ou perso). */
export interface Immunities {
  buffImmune?: string[];
  statBuffImmune?: string[];
  immuneTooltips?: string[];
}

/**
 * Réfs d'immunité AFFICHABLES : les ids de BuffToolTipTemplet, SANS la
 * sentinelle « No Immunities » (SYS_IMMUNE_EMPTY — le marqueur du panneau
 * vide, porté par ~2600 monstres : pas un statut). Un id hors table est une
 * réf MORTE que le jeu ne peut pas rendre non plus (cas unique : 4103 chez
 * Akari 4500090, un id de ligne BuffTemplet glissé dans la colonne — il
 * contredit même son BuffImmune déclaré).
 */
export function loadImmuneTooltipIds(): Set<string> {
  const ok = new Set<string>();
  for (const t of loadTable('BuffToolTipTemplet')) {
    if (t.ID && t.NameID !== 'SYS_IMMUNE_EMPTY') ok.add(t.ID);
  }
  return ok;
}

/**
 * `BuffImmune` / `StatBuffImmune` / `BuffImmuneToolTip` d'une ligne — la même
 * lecture pour les monstres et les persos (`CCharacterData.IsImmune` /
 * `IsImmuneStat` lisent ces colonnes sur tout `CharacterTemplet`). Champs
 * vides absents ; tooltips filtrés par `loadImmuneTooltipIds`.
 */
export function readImmunities(r: Row, immuneTooltipOk: Set<string>): Immunities {
  const out: Immunities = {};
  const buffImmune = splitCsv(r.BuffImmune ?? '');
  if (buffImmune.length) out.buffImmune = buffImmune;
  const statBuffImmune = splitCsv(r.StatBuffImmune ?? '');
  if (statBuffImmune.length) out.statBuffImmune = statBuffImmune;
  const immuneTooltips = splitCsv(r.BuffImmuneToolTip ?? '').filter((t) => immuneTooltipOk.has(t));
  if (immuneTooltips.length) out.immuneTooltips = immuneTooltips;
  return out;
}
