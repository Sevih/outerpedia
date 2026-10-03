'use client';

import { useCallback, useMemo, useRef } from 'react';
import { useStoredState } from '@/lib/client-storage';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { TIER_PALETTE, buildCanon, encodeState, type Tier } from './share-codec';
import {
  makeDefaultTiers,
  safeFileStem,
  type Tab,
  type TierItem,
  type TlmLabels,
} from './contracts';
import { SETTINGS_SPEC, type TlmSettings } from './stores';
import { useTierListState } from './use-tier-list-state';
import { usePool } from './use-pool';
import { useExportPng } from './use-export-png';
import { Toolbar } from './Toolbar';
import { TierRows } from './TierRows';
import { PoolPanel } from './PoolPanel';

// ── Composant principal ──

/**
 * Éditeur de tier list (porté tel quel) : glisser-déposer (souris + tactile),
 * lignes éditables (label/couleur/ordre), pool filtrable en trois onglets,
 * partage par lien court (`?s=` via /api/tierlist, repli lien long `?z=`),
 * export PNG canvas et export/import JSON. L'état de la LISTE vit dans l'URL
 * (source de vérité partageable) ; seuls les réglages d'affichage sont
 * persistés (`useStoredState`, clé héritée `tlm-settings` absorbée).
 */
export function TierListMakerBrowser({
  characters,
  ee,
  bosses,
  labels: L,
}: {
  characters: TierItem[];
  ee: TierItem[];
  bosses: TierItem[];
  labels: TlmLabels;
}) {
  // Répertoire de tous les items disponibles.
  const itemMap = useMemo(() => {
    const m = new Map<string, TierItem>();
    for (const it of characters) m.set(it.key, it);
    for (const it of ee) m.set(it.key, it);
    for (const it of bosses) m.set(it.key, it);
    return m;
  }, [characters, ee, bosses]);

  const sourceByTab = useMemo<Record<Tab, TierItem[]>>(
    () => ({ characters, ee, bosses }),
    [characters, ee, bosses],
  );

  // Index stable par type — compacité et stabilité du lien de partage.
  const canon = useMemo(() => buildCanon(characters, ee, bosses), [characters, ee, bosses]);

  // Réglages d'affichage persistés (un seul objet — cf. SETTINGS_SPEC).
  const [settings, setSettings] = useStoredState(SETTINGS_SPEC);
  const {
    iconSize,
    showNames,
    showElement,
    showClass,
    showRarity,
    showSkins,
    showSkinNames,
    showCards,
    cardSize,
    showCardTags,
  } = settings;
  const patchSettings = (patch: Partial<TlmSettings>) =>
    setSettings((prev) => ({ ...prev, ...patch }));
  const { copy, copied } = useCopyToClipboard(2000);

  // État de la liste (titre, tiers, cycle URL `?s=` / `?z=`) et interactions
  // (sélection, glisser-déposer, toucher-placer) : dans useTierListState
  // (découpage du 03/10/2026) — destructuré sous les MÊMES noms que les anciens
  // useState / useCallback.
  const {
    title,
    setTitle,
    tiers,
    setTiers,
    shareBaselineRef,
    selectedKey,
    setSelectedKey,
    drag,
    dropAt,
    rowDragActive,
    onRowHandlePointerDown,
    onItemPointerDown,
    tapZone,
    placeByKeyboard,
    keySelect,
    placeBtnClass,
  } = useTierListState({ canon });

  // Pool (onglet, recherche, filtres, tri) et ses dérivés : dans usePool.
  const {
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
  } = usePool({ sourceByTab, tiers, showSkins });

  // Deux lignes de nom distinctes : « noms » = toujours le nom du PERSO (un
  // skin affiche celui de son perso de base) ; « noms de skin » = le nom du
  // costume en ligne dédiée sous la tuile OU la carte, au toggle.
  const labelFor = useCallback((it: TierItem) => it.baseLabel ?? it.label, []);
  const shortFor = useCallback((it: TierItem) => (it.isSkin ? it.baseShort : it.short), []);
  const skinLabelFor = useCallback(
    (it: TierItem) => (it.isSkin && showSkinNames ? (it.short ?? it.label) : undefined),
    [showSkinNames],
  );

  // ── Opérations sur les lignes ──
  const updateTier = (id: string, patch: Partial<Tier>) =>
    setTiers((prev) => prev.map((tr) => (tr.id === id ? { ...tr, ...patch } : tr)));

  const addRow = (afterIdx: number) =>
    setTiers((prev) => {
      const next = [...prev];
      next.splice(afterIdx + 1, 0, {
        id: `t-${Math.random().toString(36).slice(2, 8)}`,
        label: '',
        color: TIER_PALETTE[next.length % TIER_PALETTE.length],
        items: [],
      });
      return next;
    });

  const deleteRow = (id: string) => {
    if (tiers.length <= 1) return;
    const row = tiers.find((tr) => tr.id === id);
    if (row && row.items.length > 0 && !window.confirm(L.confirmDeleteRow)) return;
    setTiers((prev) => prev.filter((tr) => tr.id !== id));
  };

  const moveRow = (idx: number, dir: -1 | 1) =>
    setTiers((prev) => {
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });

  const clearRow = (id: string) => {
    if (!window.confirm(L.confirmClearRow)) return;
    updateTier(id, { items: [] });
  };

  const resetAll = () => {
    if (!window.confirm(L.confirmReset)) return;
    setTitle('');
    setTiers(makeDefaultTiers());
    setSelectedKey(null);
    shareBaselineRef.current = null;
  };

  // ── Export / import JSON ──
  const importInputRef = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    const data = {
      title,
      tiers: tiers.map((tr) => ({ label: tr.label, color: tr.color, items: tr.items })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeFileStem(title)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as {
          title?: unknown;
          tiers?: { label?: unknown; color?: unknown; items?: unknown }[];
        };
        if (!Array.isArray(data?.tiers)) throw new Error('bad');
        const next: Tier[] = data.tiers.map((tr, i) => ({
          id: `t${i}-${Math.random().toString(36).slice(2, 7)}`,
          label: typeof tr.label === 'string' ? tr.label : '',
          // Même forme que `codeToColor` : une couleur libre (`red`) faisait
          // protester `<input type="color">` et s'encodait `cred`, que le décodeur
          // rejetait — le lien partagé perdait la couleur.
          color:
            typeof tr.color === 'string' && /^#[0-9a-f]{6}$/i.test(tr.color)
              ? tr.color
              : TIER_PALETTE[i % TIER_PALETTE.length],
          items: Array.isArray(tr.items)
            ? tr.items.filter((k: unknown): k is string => typeof k === 'string' && itemMap.has(k))
            : [],
        }));
        if (!next.length) throw new Error('empty');
        setTitle(typeof data.title === 'string' ? data.title : '');
        setTiers(next);
        setSelectedKey(null);
        shareBaselineRef.current = null;
      } catch {
        window.alert(L.importError);
      }
    };
    reader.readAsText(file);
  };

  // ── Partage ──
  // Tente le stockage serveur et copie un lien court `?s=<id>` ; stockage
  // indisponible (dev, BDD coupée) → repli sur le lien long `?z=` autoporté.
  const copyLink = async () => {
    const z = encodeState(title, tiers, canon);
    const base = `${window.location.origin}${window.location.pathname}`;
    let url = `${base}?z=${z}`;
    try {
      const res = await fetch('/api/tierlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ z }),
      });
      if (res.ok) {
        const data = (await res.json()) as { id?: unknown };
        if (typeof data?.id === 'string') url = `${base}?s=${data.id}`;
      }
    } catch {
      // erreur réseau → on garde le lien long autoporté
    }
    if (!(await copy(url))) window.prompt('', url);
  };

  // ── Export PNG (reflète les réglages d'affichage à l'écran) : dans useExportPng ──
  const exportPng = useExportPng({
    tiers,
    title,
    itemMap,
    iconSize,
    showNames,
    showElement,
    showClass,
    showRarity,
    showCards,
    cardSize,
    showCardTags,
    showSkinNames,
    labelFor,
    shortFor,
    labels: L,
  });

  // ── Rendu ──
  // Compte les persos de BASE — les costumes sont un extra opt-in masqué par défaut.
  const baseCharCount = useMemo(() => characters.filter((c) => !c.isSkin).length, [characters]);
  const TABS: { id: Tab; count: number }[] = [
    { id: 'characters', count: baseCharCount },
    { id: 'ee', count: ee.length },
    { id: 'bosses', count: bosses.length },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      {/* Titre + barre d'outils */}
      <Toolbar
        title={title}
        setTitle={setTitle}
        copyLink={copyLink}
        copied={copied}
        exportPng={exportPng}
        settings={settings}
        patchSettings={patchSettings}
        exportJson={exportJson}
        importInputRef={importInputRef}
        resetAll={resetAll}
        labels={L}
      />

      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) importJson(f);
          e.target.value = '';
        }}
      />

      <p className="text-content-subtle mb-3 text-center text-xs">{L.hint}</p>

      <div className="lg:flex lg:items-start lg:gap-4">
        <div className="lg:min-w-0 lg:flex-1">
          {/* Lignes de tiers */}
          <TierRows
            tiers={tiers}
            dropAt={dropAt}
            drag={drag}
            rowDragActive={rowDragActive}
            selectedKey={selectedKey}
            itemMap={itemMap}
            iconSize={iconSize}
            showNames={showNames}
            showElement={showElement}
            showClass={showClass}
            showRarity={showRarity}
            showCards={showCards}
            cardSize={cardSize}
            showCardTags={showCardTags}
            labelFor={labelFor}
            shortFor={shortFor}
            skinLabelFor={skinLabelFor}
            tapZone={tapZone}
            placeByKeyboard={placeByKeyboard}
            placeBtnClass={placeBtnClass}
            onItemPointerDown={onItemPointerDown}
            keySelect={keySelect}
            onRowHandlePointerDown={onRowHandlePointerDown}
            updateTier={updateTier}
            moveRow={moveRow}
            clearRow={clearRow}
            deleteRow={deleteRow}
            addRow={addRow}
            labels={L}
          />
        </div>

        {/* Pool — panneau latéral en desktop, empilé en dessous en mobile */}
        <PoolPanel
          TABS={TABS}
          tab={tab}
          setTab={setTab}
          rawQuery={rawQuery}
          setRawQuery={setRawQuery}
          query={query}
          sort={sort}
          setSort={setSort}
          elementFilter={elementFilter}
          setElementFilter={setElementFilter}
          classFilter={classFilter}
          setClassFilter={setClassFilter}
          rarityFilter={rarityFilter}
          setRarityFilter={setRarityFilter}
          tagFilter={tagFilter}
          setTagFilter={setTagFilter}
          skinsOnly={skinsOnly}
          setSkinsOnly={setSkinsOnly}
          placed={placed}
          poolItems={poolItems}
          selectedKey={selectedKey}
          drag={drag}
          iconSize={iconSize}
          showNames={showNames}
          showElement={showElement}
          showClass={showClass}
          showRarity={showRarity}
          labelFor={labelFor}
          shortFor={shortFor}
          skinLabelFor={skinLabelFor}
          tapZone={tapZone}
          placeByKeyboard={placeByKeyboard}
          placeBtnClass={placeBtnClass}
          onItemPointerDown={onItemPointerDown}
          keySelect={keySelect}
          labels={L}
        />
      </div>

      {/* Fantôme de drag */}
      {drag && (
        <div
          className="pointer-events-none fixed z-100 -translate-x-1/2 -translate-y-1/2 opacity-90"
          style={{ left: drag.x, top: drag.y }}
        >
          <img
            src={itemMap.get(drag.key)?.img}
            alt=""
            aria-hidden
            className="h-16 w-16 rounded-md border-2 border-amber-400 object-cover shadow-2xl"
            width={64}
            height={64}
          />
        </div>
      )}
    </div>
  );
}
