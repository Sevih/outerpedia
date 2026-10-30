'use client';

/**
 * POOL du Tier List Maker : onglet, recherche, filtres et tri, plus les deux
 * dérivés — `placed` (les clés déjà rangées) et `poolItems` (ce qui reste à
 * ranger, filtré et trié). Extrait du composant principal (découpage du
 * 03/10/2026 — déplacement mécanique, logique inchangée).
 */
import { useDeferredValue, useMemo, useState } from 'react';
import { ELEMENT_ORDER } from '@/lib/images';
import { normalizeSearchText } from '@/lib/search-text';
import type { Tier } from './share-codec';
import type { SortKey, Tab, TierItem } from './contracts';
import { poolFilter } from './pool-filter';

export function usePool({
  sourceByTab,
  tiers,
  showSkins,
}: {
  sourceByTab: Record<Tab, TierItem[]>;
  tiers: Tier[];
  /** Réglage « afficher les skins » — sans lui, le pool masque les costumes. */
  showSkins: boolean;
}) {
  // État du pool
  const [tab, setTab] = useState<Tab>('characters');
  const [rawQuery, setRawQuery] = useState('');
  const query = useDeferredValue(rawQuery);
  const [elementFilter, setElementFilter] = useState<string[]>([]);
  const [classFilter, setClassFilter] = useState<string[]>([]);
  const [rarityFilter, setRarityFilter] = useState<number[]>([]);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [skinsOnly, setSkinsOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>('default');

  // ── Dérivés : clés placées + pool ──
  const placed = useMemo(() => new Set(tiers.flatMap((t) => t.items)), [tiers]);

  const poolItems = useMemo(() => {
    const q = normalizeSearchText(query.trim());
    const filtered = poolFilter(sourceByTab[tab], {
      q,
      placed,
      skinsOnly,
      showSkins,
      elementFilter,
      classFilter,
      rarityFilter,
      tagFilter,
    });
    if (sort === 'default') return filtered;
    const arr = [...filtered];
    if (sort === 'name') arr.sort((a, b) => a.label.localeCompare(b.label));
    else if (sort === 'rarity')
      arr.sort((a, b) => (b.rarity ?? 0) - (a.rarity ?? 0) || a.label.localeCompare(b.label));
    else if (sort === 'element')
      arr.sort(
        (a, b) =>
          ELEMENT_ORDER.indexOf((a.element ?? '') as (typeof ELEMENT_ORDER)[number]) -
            ELEMENT_ORDER.indexOf((b.element ?? '') as (typeof ELEMENT_ORDER)[number]) ||
          a.label.localeCompare(b.label),
      );
    return arr;
  }, [
    sourceByTab,
    tab,
    placed,
    query,
    elementFilter,
    classFilter,
    rarityFilter,
    tagFilter,
    showSkins,
    skinsOnly,
    sort,
  ]);

  return {
    tab,
    setTab,
    rawQuery,
    setRawQuery,
    query,
    elementFilter,
    setElementFilter,
    classFilter,
    setClassFilter,
    rarityFilter,
    setRarityFilter,
    tagFilter,
    setTagFilter,
    skinsOnly,
    setSkinsOnly,
    sort,
    setSort,
    placed,
    poolItems,
  };
}
