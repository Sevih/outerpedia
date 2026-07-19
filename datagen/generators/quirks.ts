/**
 * Générateur — ARBRES DE QUIRKS (nommés « Awakening » / « Gift » dans le jeu).
 *
 * Reproduit la STRUCTURE complète des 5 arbres depuis les tables du jeu :
 *   - `CharacterAwakeningTemplet` : les 5 groupes (type, coût de reset, niveau
 *     de compte requis) ;
 *   - `CharacterAwakeningNodeTemplet` : les nœuds (main/normal, icône + couleur
 *     de fond, nom/desc, connexions du graphe, main node requis + son niveau) ;
 *   - `CharacterAwakeningLevelTemplet` : coût (or + items) et effet PAR NIVEAU.
 *
 * Un sous-arbre = un main node + tous les nœuds dont `RequireMainNodeID` pointe
 * dessus (robuste : les nœuds de subclass d'un arbre de classe restent rattachés
 * à leur main). On émet aussi la GRILLE du jeu (`PageNum` = aile, `NodePosition`
 * = "col,row") : le layout d'affichage la reproduit fidèlement, main au centre.
 *
 * Valeur d'effet, dérivée PAR NIVEAU : nœuds `IOT_STAT` via `formatStatValue` ;
 * nœuds `IOT_BUFF` via le buff `Awakening_*` résolu dans `BuffTemplet` (ex.
 * Boss Dmg, OAT_RATE) ; buffs de compte `EBT_*` via `BuffValue` brut.
 */
import { loadTable, num, splitCsv, type Row } from '../lib/tables';
import { loadTextIndex, resolveText } from '../lib/text';
import { formatStatValue } from '../lib/stats';
import { slugEnum } from '../lib/enums';
import type { LangDict } from '../lib/lang';

/** Coût + effet d'un niveau de nœud. */
export interface QuirkLevel {
  level: number;
  gold: number;
  items: { id: string; count: number }[];
  /** Valeur d'effet affichable (stat), absente pour les nœuds à buff. */
  value?: string;
}

/** Un nœud de l'arbre. */
export interface QuirkNode {
  id: number;
  type: 'main' | 'normal';
  icon: string;
  /** Couleur de fond du jeu (hex), pour teinter la pastille. */
  color: string;
  /** Aile de l'arbre (0 = gauche, 1 = droite). Le main n'en a pas (-1). */
  page: number;
  /** Colonne de la grille du jeu (`NodePosition`), -1 pour le main (centre). */
  col: number;
  /** Ligne de la grille du jeu (`NodePosition`), -1 pour le main (centre). */
  row: number;
  name: LangDict;
  /** Desc avec placeholder `{0}` (rempli par la valeur du niveau à l'affichage). */
  desc: LangDict;
  /** Nœuds connectés (arêtes du graphe). */
  connections: number[];
  /** Niveau du main node requis pour débloquer ce nœud. */
  requireMainLevel: number;
  maxLevel: number;
  levels: QuirkLevel[];
}

/** Un sous-arbre (un main node + ses nœuds). */
export interface QuirkTree {
  /** Slug d'élément / classe, ou clé de catégorie pour les arbres uniques. */
  key: string;
  mainId: number;
  nodes: QuirkNode[];
}

/** Une catégorie de quirks (= un groupe d'Awakening). */
export interface QuirkCategory {
  key: 'pve' | 'class' | 'elemental' | 'utility' | 'adventure';
  /** Prix de reset (Free Ether) de la catégorie. */
  resetPrice: number;
  /** Niveau de compte requis pour débloquer la catégorie. */
  accountLevel: number;
  trees: QuirkTree[];
}

export interface QuirksData {
  categories: QuirkCategory[];
}

/** Type de groupe du jeu → clé de catégorie + ordre d'affichage (ordre V2). */
const CATEGORY: Record<string, { key: QuirkCategory['key']; order: number }> = {
  PVE: { key: 'pve', order: 0 },
  JOB: { key: 'class', order: 1 },
  ELEMENTAL: { key: 'elemental', order: 2 },
  UTILITY: { key: 'utility', order: 3 },
  ADVENTURE_LICENSE: { key: 'adventure', order: 4 },
};

// Index `AwakeningApplyTypeValue` → slug (mêmes tables que progression.ts).
const ELEMENTS = ['earth', 'water', 'fire', 'light', 'dark'];
const CLASSES = ['', 'defender', 'striker', 'ranger', 'mage', 'healer'];

export function buildQuirks(): QuirksData {
  const groups = loadTable('CharacterAwakeningTemplet');
  const nodes = loadTable('CharacterAwakeningNodeTemplet');
  const text = loadTextIndex('TextSystem');

  // Index des buffs par `BuffID` : la magnitude d'un nœud `IOT_BUFF` (ex.
  // `Awakening_Boss_Dmg_3`, +9 %) vit dans `BuffTemplet`, pas dans la ligne de
  // niveau. On la résout via ApplyingType + Value du buff.
  const buffIndex = new Map<string, Row>();
  for (const bf of loadTable('BuffTemplet'))
    if (bf.BuffID && !buffIndex.has(bf.BuffID)) buffIndex.set(bf.BuffID, bf);

  /** Valeur d'effet affichable d'une ligne de niveau (stat, buff, ou buff de
   *  compte EBT dont la magnitude est directement dans `BuffValue`). */
  const levelValue = (r: Row): string | undefined => {
    if (r.OptionType === 'IOT_STAT' && r.StatType && r.StatType !== 'ST_NONE')
      return formatStatValue(r.ApplyingType ?? '', num(r.OptionValue), slugEnum(r.StatType));
    if (r.OptionType === 'IOT_BUFF') {
      const bf = r.BuffID ? buffIndex.get(r.BuffID) : undefined;
      if (bf) {
        const stat = bf.StatType && bf.StatType !== 'ST_NONE' ? slugEnum(bf.StatType) : undefined;
        return formatStatValue(bf.ApplyingType ?? '', num(bf.Value), stat);
      }
      // Buffs de compte (EBT_*) : magnitude brute, le `%` éventuel est déjà
      // dans le texte de description.
      if (r.BuffValue && r.BuffValue !== '0') return String(num(r.BuffValue));
    }
    return undefined;
  };

  // Niveaux indexés par groupe de niveau, triés.
  const levelsByLG = new Map<string, Row[]>();
  for (const l of loadTable('CharacterAwakeningLevelTemplet')) {
    const k = l.AwakeningLevelGroupID;
    if (!k) continue;
    (levelsByLG.get(k) ?? levelsByLG.set(k, []).get(k)!).push(l);
  }
  for (const arr of levelsByLG.values())
    arr.sort((a, b) => num(a.AwakeningLevel) - num(b.AwakeningLevel));

  // Nœuds indexés par groupe d'arbre.
  const nodesByGroup = new Map<string, Row[]>();
  for (const n of nodes) {
    const k = n.AwakeningGroupID ?? '';
    (nodesByGroup.get(k) ?? nodesByGroup.set(k, []).get(k)!).push(n);
  }

  const buildNode = (n: Row): QuirkNode => {
    const levels: QuirkLevel[] = (levelsByLG.get(n.AwakeningLevelGroupID ?? '') ?? []).map((r) => {
      const ids = splitCsv(r.RequireItemID ?? '');
      const counts = splitCsv(r.RequireItemValue ?? '');
      const items = ids
        .map((id, i) => ({ id, count: num(counts[i]) }))
        .filter((x) => x.id && x.id !== '0' && x.count > 0);
      const value = levelValue(r);
      return {
        level: num(r.AwakeningLevel),
        gold: num(r.RequireGold),
        items,
        ...(value ? { value } : {}),
      };
    });
    // `NodePosition` = "col,row" pour un nœud normal ; "0" (ou vide) pour le
    // main, qui n'a pas de case dans la grille (il est au centre de l'arbre).
    const isMain = n.AwakeningNodeType === 'ANT_MAIN';
    const [col, row] = isMain ? [-1, -1] : splitCsv(n.NodePosition ?? '').map((x) => num(x));
    return {
      id: num(n.ID),
      type: isMain ? 'main' : 'normal',
      icon: n.NodeIconName ?? '',
      color: n.NodeIconBgColorHex ?? '',
      page: isMain ? -1 : num(n.PageNum),
      col: col ?? -1,
      row: row ?? -1,
      name: resolveText(text, n.NodeNameID),
      desc: resolveText(text, n.NodeDescID),
      connections: splitCsv(n.ConnectionNodeID ?? '')
        .map((x) => num(x))
        .filter((x) => x > 0),
      requireMainLevel: num(n.RequireMainNodeLevel),
      maxLevel: levels.length,
      levels,
    };
  };

  const categories: QuirkCategory[] = [];
  for (const g of groups) {
    const cat = CATEGORY[g.AwakeningType ?? ''];
    if (!cat) continue;
    const groupNodes = nodesByGroup.get(g.AwakeningGroupID ?? '') ?? [];
    const mains = groupNodes.filter((n) => n.AwakeningNodeType === 'ANT_MAIN');
    const trees: QuirkTree[] = mains.map((main) => {
      const subtree = [main, ...groupNodes.filter((n) => n.RequireMainNodeID === main.ID)];
      const v = num(main.AwakeningApplyTypeValue);
      const key =
        cat.key === 'elemental' ? ELEMENTS[v] : cat.key === 'class' ? CLASSES[v] : cat.key;
      return { key: key || cat.key, mainId: num(main.ID), nodes: subtree.map(buildNode) };
    });
    categories.push({
      key: cat.key,
      resetPrice: num(g.ResetPrice),
      accountLevel: num(g.AccountLevel),
      trees,
    });
  }
  categories.sort((a, b) => (CATEGORY_ORDER[a.key] ?? 9) - (CATEGORY_ORDER[b.key] ?? 9));
  return { categories };
}

const CATEGORY_ORDER: Record<string, number> = {
  pve: 0,
  class: 1,
  elemental: 2,
  utility: 3,
  adventure: 4,
};
