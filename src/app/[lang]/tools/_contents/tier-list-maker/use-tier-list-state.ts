'use client';

/**
 * État de la LISTE du Tier List Maker et ce qui la fait bouger — extrait du
 * composant principal (découpage du 03/10/2026 — déplacement mécanique,
 * logique inchangée). Le hook possède :
 *   - le titre et les tiers, dont la source de vérité partageable est l'URL :
 *     hydratation unique au montage (lien court `?s=` via /api/tierlist, sinon
 *     `?z=`), puis réécriture débouncée de la barre d'adresse.
 *     `shareBaselineRef` garde le lien court tant que la liste n'a pas bougé —
 *     le parent le vide au reset et à l'import ;
 *   - l'état d'interaction : item sélectionné, glisser-déposer des items
 *     (souris + appui long tactile) et des lignes (poignée), toucher-placer et
 *     son équivalent clavier.
 * Les deux vivent ensemble parce que les gestes écrivent les tiers : `setTiers`
 * reste un setter LOCAL, les tableaux de dépendances n'ont pas bougé.
 * Le composant principal DESTRUCTURE le retour sous les MÊMES noms que les
 * anciens useState / useCallback.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { decodeState, encodeState, type Canon, type Tier } from './share-codec';
import { DRAG_THRESHOLD, TOUCH_HOLD_MS, makeDefaultTiers } from './contracts';
import {
  computeDrop,
  moveKeyToVisualIndex,
  moveRowToIndex,
  placeKey,
  removeKey,
  rowIndexAtY,
} from './tier-ops';

export function useTierListState({ canon }: { canon: Canon }) {
  // État du tableau
  const [title, setTitle] = useState('');
  const [tiers, setTiers] = useState<Tier[]>(makeDefaultTiers);

  // État d'interaction
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ key: string; x: number; y: number } | null>(null);
  const [dropAt, setDropAt] = useState<{ tierId: string; index: number } | null>(null);

  // ── Hydratation depuis l'URL / synchro de l'URL ──
  const didHydrate = useRef(false);
  const lastUrlRef = useRef('');
  // Payload d'une liste ouverte par lien court `?s=` — conservé jusqu'à la
  // première édition pour que la barre d'adresse garde le lien compact.
  const shareBaselineRef = useRef<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;

    const apply = (z: string | null, fromShortLink = false) => {
      const decoded = decodeState(z, canon);
      if (decoded && decoded.tiers.length) {
        setTitle(decoded.title);
        setTiers(decoded.tiers);
        if (fromShortLink && z) shareBaselineRef.current = z;
      }
    };

    const params = new URLSearchParams(window.location.search);
    const shortId = params.get('s');
    if (shortId) {
      fetch(`/api/tierlist/${encodeURIComponent(shortId)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { z?: unknown } | null) => {
          if (typeof data?.z === 'string') apply(data.z, true);
        })
        .catch(() => {})
        .finally(() => setHydrated(true));
    } else {
      const z = params.get('z');
      // Différé en microtâche : même chemin asynchrone que la branche `?s=`
      // (pas de setState synchrone dans un effet — rendus en cascade).
      void Promise.resolve().then(() => {
        apply(z);
        setHydrated(true);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydratation unique
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const handle = setTimeout(() => {
      const z = encodeState(title, tiers, canon);
      // Liste inchangée encore sous son lien court → ne pas toucher l'URL.
      if (shareBaselineRef.current === z) return;
      const path = window.location.pathname;
      const isPristine = !title && tiers.every((t) => t.items.length === 0);
      const next = isPristine ? path : `${path}?z=${z}`;
      if (lastUrlRef.current !== next) {
        lastUrlRef.current = next;
        // replaceState ne met à jour QUE la barre d'adresse — pas de fetch RSC,
        // pas de re-rendu (contrairement à router.replace).
        window.history.replaceState(window.history.state, '', next);
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [hydrated, title, tiers, canon]);

  // ── Glisser-déposer (pointer events, souris + tactile) ──
  const startRef = useRef<{ x: number; y: number; key: string } | null>(null);
  const armedRef = useRef(false);
  const draggingRef = useRef(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Réordonnancement des lignes par poignée
  const rowDragId = useRef<string | null>(null);
  const rowDraggingRef = useRef(false);
  const [rowDragActive, setRowDragActive] = useState<string | null>(null);

  // Bloque le défilement de page pendant un drag actif (tactile).
  useEffect(() => {
    const block = (e: TouchEvent) => {
      if (draggingRef.current || rowDraggingRef.current) e.preventDefault();
    };
    document.addEventListener('touchmove', block, { passive: false });
    return () => document.removeEventListener('touchmove', block);
  }, []);

  // Fin du drag de LIGNE en cours (ou rien). Tenue dans un ref pour que le
  // démontage puisse la jouer : le drag d'ITEM a son `cleanupPointer`, celui
  // des lignes laissait ses écouteurs `window` derrière lui.
  const endRowDragRef = useRef<(() => void) | null>(null);
  useEffect(() => () => endRowDragRef.current?.(), []);

  const onRowHandlePointerDown = useCallback((e: React.PointerEvent, id: string) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.stopPropagation();
    rowDragId.current = id;
    rowDraggingRef.current = true;
    setRowDragActive(id);
    const onMove = (ev: PointerEvent) => {
      if (rowDragId.current)
        setTiers((prev) => moveRowToIndex(prev, rowDragId.current!, rowIndexAtY(ev.clientY)));
    };
    const onEnd = () => {
      endRowDragRef.current = null;
      rowDragId.current = null;
      rowDraggingRef.current = false;
      setRowDragActive(null);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
    };
    endRowDragRef.current = onEnd;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
  }, []);

  const updateDragOver = useCallback((x: number, y: number) => {
    const d = computeDrop(x, y);
    setDropAt(d && d.type === 'tier' ? { tierId: d.tierId, index: d.index } : null);
  }, []);

  const handleDrop = useCallback((key: string, x: number, y: number) => {
    const d = computeDrop(x, y);
    if (!d) return;
    if (d.type === 'pool') setTiers((prev) => removeKey(prev, key));
    else setTiers((prev) => moveKeyToVisualIndex(prev, key, d.tierId, d.index));
  }, []);

  const handleTap = useCallback((key: string) => {
    setSelectedKey((cur) => (cur === key ? null : key));
  }, []);

  const endPointer = useRef<((e: PointerEvent) => void) | null>(null);
  const movePointer = useRef<((e: PointerEvent) => void) | null>(null);

  const cleanupPointer = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (movePointer.current) window.removeEventListener('pointermove', movePointer.current);
    if (endPointer.current) {
      window.removeEventListener('pointerup', endPointer.current);
      window.removeEventListener('pointercancel', endPointer.current);
    }
    startRef.current = null;
    armedRef.current = false;
    draggingRef.current = false;
  }, []);

  const onItemPointerDown = useCallback(
    (e: React.PointerEvent, key: string) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      startRef.current = { x: e.clientX, y: e.clientY, key };
      draggingRef.current = false;
      armedRef.current = e.pointerType === 'mouse';

      const onMove = (ev: PointerEvent) => {
        const s = startRef.current;
        if (!s) return;
        const dist = Math.hypot(ev.clientX - s.x, ev.clientY - s.y);
        if (!armedRef.current) {
          // Tactile avant la fin de l'appui long : bouger = défilement.
          if (dist > 10) cleanupPointer();
          return;
        }
        if (!draggingRef.current) {
          if (dist < DRAG_THRESHOLD) return;
          draggingRef.current = true;
        }
        setDrag({ key: s.key, x: ev.clientX, y: ev.clientY });
        updateDragOver(ev.clientX, ev.clientY);
      };

      const onEnd = (ev: PointerEvent) => {
        const s = startRef.current;
        const wasDragging = draggingRef.current;
        cleanupPointer();
        setDrag(null);
        setDropAt(null);
        if (!s) return;
        if (wasDragging) handleDrop(s.key, ev.clientX, ev.clientY);
        else handleTap(s.key);
      };

      movePointer.current = onMove;
      endPointer.current = onEnd;
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onEnd);
      window.addEventListener('pointercancel', onEnd);

      if (e.pointerType !== 'mouse') {
        holdTimer.current = setTimeout(() => {
          armedRef.current = true;
          draggingRef.current = true;
          const s = startRef.current;
          if (s) {
            setDrag({ key: s.key, x: s.x, y: s.y });
            updateDragOver(s.x, s.y);
          }
        }, TOUCH_HOLD_MS);
      }
    },
    [cleanupPointer, handleDrop, handleTap, updateDragOver],
  );

  useEffect(() => cleanupPointer, [cleanupPointer]);

  // ── Toucher-placer : taper un tier / le pool avec un item sélectionné ──
  const placeSelected = useCallback(
    (action: 'pool' | string) => {
      if (!selectedKey) return;
      if (action === 'pool') setTiers((prev) => removeKey(prev, selectedKey));
      else setTiers((prev) => placeKey(prev, selectedKey, action, null));
      setSelectedKey(null);
    },
    [selectedKey],
  );
  const tapZone = useCallback(
    (e: React.MouseEvent, action: 'pool' | string) => {
      if ((e.target as HTMLElement).closest('[data-item-key]')) return; // géré par l'item
      placeSelected(action);
    },
    [placeSelected],
  );
  // Le même placement au CLAVIER : les zones ne peuvent pas être des boutons
  // (elles contiennent les items, eux-mêmes boutons), d'où un bouton dédié par
  // zone, rendu tant qu'un item est sélectionné et visible au seul focus. Le
  // focus suit ensuite l'item placé — sans quoi il retomberait sur `<body>`.
  const placeByKeyboard = (e: React.MouseEvent, action: 'pool' | string) => {
    e.stopPropagation();
    const key = selectedKey;
    placeSelected(action);
    if (key)
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>(`[data-item-key="${CSS.escape(key)}"]`)?.focus(),
      );
  };
  // Sélection au clavier : le focus saute au premier bouton de placement (le
  // tier du haut) — ils précèdent le pool dans l'ordre du DOM, Tab depuis un item
  // du pool ne les atteindrait jamais. Désélection : plus de bouton, rien ne bouge.
  const keySelect = useCallback(
    (key: string) => {
      handleTap(key);
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-place]')?.focus());
    },
    [handleTap],
  );
  const placeBtnClass =
    'sr-only focus:not-sr-only focus:rounded focus:bg-amber-400 focus:px-2 focus:py-1 focus:text-xs focus:font-semibold focus:text-[#1a1a1a]';

  return {
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
  };
}
