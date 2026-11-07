/**
 * Filtrage de la grille de `/characters` — fonction PURE, sortie du
 * `useMemo` de `CharactersBrowser` (A86) pour être testée sans rendu.
 *
 * Règle commune : OU entre les valeurs cochées d'une même facette, ET entre
 * les facettes ; tags et effets suivent en plus leur bascule ET/OU.
 */
import type { CharacterRow } from '../CharactersBrowser';
import type { FilterState } from './filter-codec';
import { normalizeSearchText } from '@/lib/search-text';

/** Familles de tags : valeur de case → tags couverts (`limited` → festival…). */
export type TagGroups = Record<string, string[]>;

export function filterCharacterRows(
  rows: CharacterRow[],
  s: FilterState,
  tagGroups: TagGroups,
): CharacterRow[] {
  const needle = normalizeSearchText(s.q);
  const elS = new Set(s.element);
  const clS = new Set(s.klass);
  const scS = new Set(s.subClass);
  const rS = new Set(s.rarity);
  const chS = new Set(s.chain);
  const gS = new Set(s.gift);
  const roS = new Set(s.role);
  const { tags, tagLogic, buffs, debuffs, effectLogic, sources, teamBonuses } = s;

  /** Le row porte-t-il ce tag — ou, pour une famille, l'un de ses tags ? */
  const matchTag = (row: CharacterRow, tag: string) => {
    const members = tagGroups[tag];
    return members ? members.some((m) => row.tags.includes(m)) : row.tags.includes(tag);
  };

  // Un effet appliqué par le perso, RESTREINT aux sources sélectionnées le cas
  // échéant (règle historique `charHasEffectFromSources`). Clés déjà canoniques.
  const hasEffect = (row: CharacterRow, key: string, side: 'buff' | 'debuff') => {
    if (!sources.length) return (row[side] ?? []).includes(key);
    const ebs = row.effectsBySource;
    if (!ebs) return (row[side] ?? []).includes(key);
    return sources.some((src) => (ebs[src]?.[side] ?? []).includes(key));
  };

  return rows.filter((row) => {
    if (needle && !row.searchNames.some((n) => n.includes(needle))) return false;
    if (elS.size && !elS.has(row.element)) return false;
    if (clS.size && !clS.has(row.class)) return false;
    // Un perso sans sous-classe n'est jamais retenu quand le filtre est actif.
    if (scS.size && (!row.subClass || !scS.has(row.subClass))) return false;
    if (rS.size && !rS.has(row.rarity)) return false;
    if (chS.size && (!row.chainType || !chS.has(row.chainType))) return false;
    if (gS.size && (!row.gift || !gS.has(row.gift))) return false;
    if (roS.size && (!row.role || !roS.has(row.role))) return false;
    if (tags.length) {
      const ok =
        tagLogic === 'AND'
          ? tags.every((t) => matchTag(row, t))
          : tags.some((t) => matchTag(row, t));
      if (!ok) return false;
    }
    // Effets : buffs et debuffs combinés selon la logique ET/OU (inchangé).
    if (buffs.length || debuffs.length) {
      const hb = buffs.length
        ? effectLogic === 'AND'
          ? buffs.every((b) => hasEffect(row, b, 'buff'))
          : buffs.some((b) => hasEffect(row, b, 'buff'))
        : true;
      const hd = debuffs.length
        ? effectLogic === 'AND'
          ? debuffs.every((d) => hasEffect(row, d, 'debuff'))
          : debuffs.some((d) => hasEffect(row, d, 'debuff'))
        : true;
      const match =
        buffs.length && debuffs.length
          ? effectLogic === 'AND'
            ? hb && hd
            : hb || hd
          : buffs.length
            ? hb
            : hd;
      if (!match) return false;
    }
    // Bonus d'équipe : le perso doit fournir AU MOINS un des bonus cochés (OU).
    if (teamBonuses.length && !row.teamBonuses?.some((tb) => teamBonuses.includes(tb)))
      return false;
    return true;
  });
}
