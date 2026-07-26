/**
 * Localisation SERVEUR des arbres de quirks — source unique partagée entre le
 * guide « How Quirks Work » et le réglage de compte du damage calculator.
 * (Vit à part des .tsx : `getCatalog` tire les gros JSON d'items — jamais dans
 * un module importé côté client.)
 */
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { img } from '@/lib/images';
import { getCatalog } from '@/lib/data/items';
import type { LocalizedText, QuirksData } from '@contracts';
import type { LocalTree, QuirkTreeLabels } from './QuirkTreeView';

const L = (m: LocalizedText, lang: Lang): string => lRec(m, lang) || m.en || '';

export const ELEMENT_NAME: Record<string, LocalizedText> = {
  earth: { en: 'Earth', jp: '地', kr: '땅', zh: '地', fr: 'Terre' },
  water: { en: 'Water', jp: '水', kr: '물', zh: '水', fr: 'Eau' },
  fire: { en: 'Fire', jp: '火', kr: '불', zh: '火', fr: 'Feu' },
  light: { en: 'Light', jp: '光', kr: '빛', zh: '光', fr: 'Lumière' },
  dark: { en: 'Dark', jp: '闇', kr: '어둠', zh: '暗', fr: 'Ténèbres' },
};

export const CLASS_NAME: Record<string, LocalizedText> = {
  defender: { en: 'Defender', jp: 'ディフェンダー', kr: '디펜더', zh: '防御者', fr: 'Defender' },
  striker: { en: 'Striker', jp: 'ストライカー', kr: '스트라이커', zh: '打击者', fr: 'Striker' },
  ranger: { en: 'Ranger', jp: 'レンジャー', kr: '레인저', zh: '游侠', fr: 'Ranger' },
  mage: { en: 'Mage', jp: 'メイジ', kr: '메이지', zh: '法师', fr: 'Mage' },
  healer: { en: 'Healer', jp: 'ヒーラー', kr: '힐러', zh: '治疗者', fr: 'Healer' },
};

const TREE_LABELS: Record<keyof QuirkTreeLabels, LocalizedText> = {
  level: { en: 'Level', jp: 'レベル', kr: '레벨', zh: '等级', fr: 'Niveau' },
  cost: {
    en: 'Cost to this level:',
    jp: 'このレベルまでのコスト：',
    kr: '이 레벨까지 비용:',
    zh: '至该等级消耗：',
    fr: 'Coût jusqu’à ce niveau :',
  },
  unlockAt: {
    en: '· unlocks at main Lv.',
    jp: '· メインLv.で解放',
    kr: '· 메인 Lv. 해금',
    zh: '· 主节点Lv.解锁',
    fr: '· débloqué au main Lv.',
  },
  mainNode: { en: 'Main', jp: 'メイン', kr: '메인', zh: '主', fr: 'Main' },
};

/** Libellés du panneau de détail d'un arbre, localisés. */
export function quirkTreeLabels(lang: Lang): QuirkTreeLabels {
  return {
    level: L(TREE_LABELS.level, lang),
    cost: L(TREE_LABELS.cost, lang),
    unlockAt: L(TREE_LABELS.unlockAt, lang),
    mainNode: L(TREE_LABELS.mainNode, lang),
  };
}

/** Un arbre de `quirks.json`, nœuds pré-localisés pour `QuirkTreeView`. */
export function localizeTree(
  tree: QuirksData['categories'][number]['trees'][number],
  lang: Lang,
): LocalTree {
  return {
    key: tree.key,
    mainId: tree.mainId,
    nodes: tree.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      color: n.color || 'var(--color-line-strong)',
      icon: n.icon,
      name: L(n.name, lang),
      desc: L(n.desc, lang),
      connections: n.connections,
      page: n.page,
      col: n.col,
      row: n.row,
      requireMainLevel: n.requireMainLevel,
      maxLevel: n.maxLevel,
      levels: n.levels,
    })),
  };
}

/** Sous-libellé d'un arbre dans sa catégorie (élément / classe), localisé. */
export function quirkTreeSubLabel(catKey: string, treeKey: string, lang: Lang): string | null {
  if (catKey === 'elemental') return L(ELEMENT_NAME[treeKey] ?? { en: treeKey }, lang);
  if (catKey === 'class') return L(CLASS_NAME[treeKey] ?? { en: treeKey }, lang);
  return null;
}

/** Catalogue des matériaux référencés par les niveaux des nœuds (nom + icône). */
export function collectQuirkMaterials(
  quirks: QuirksData,
  lang: Lang,
): Record<string, { name: string; icon: string }> {
  const catalog = getCatalog();
  const materials: Record<string, { name: string; icon: string }> = {};
  for (const c of quirks.categories)
    for (const tr of c.trees)
      for (const n of tr.nodes)
        for (const l of n.levels)
          for (const it of l.items) {
            if (materials[it.id]) continue;
            const e = catalog[it.id];
            if (e) materials[it.id] = { name: L(e.name, lang), icon: img.item(e.icon) };
          }
  return materials;
}
