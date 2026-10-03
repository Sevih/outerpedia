/**
 * Opérations sur les tiers, HORS React : mutations immuables de la liste
 * (retirer, placer, déplacer un item ou une ligne) et lecture du DOM qui
 * résout un pointeur en cible (`rowIndexAtY`, `computeDrop`). Extrait de
 * `TierListMakerBrowser.tsx` le 03/10/2026 (découpage mécanique, contenu
 * inchangé).
 */
import type { Tier } from './share-codec';

// ── Mutations de tiers ──

export function removeKey(tiers: Tier[], key: string): Tier[] {
  return tiers.map((t) => ({ ...t, items: t.items.filter((k) => k !== key) }));
}

/** Retire `key` partout puis l'insère dans `tierId` (avant `beforeKey`, ou à la fin). */
export function placeKey(
  tiers: Tier[],
  key: string,
  tierId: string,
  beforeKey: string | null,
): Tier[] {
  const cleaned = removeKey(tiers, key);
  const idx = cleaned.findIndex((t) => t.id === tierId);
  if (idx < 0) return cleaned;
  const items = [...cleaned[idx].items];
  let pos = items.length;
  if (beforeKey) {
    const bi = items.indexOf(beforeKey);
    if (bi >= 0) pos = bi;
  }
  items.splice(pos, 0, key);
  cleaned[idx] = { ...cleaned[idx], items };
  return cleaned;
}

/** Déplace `key` dans `tierId` à un index d'insertion VISUEL (calculé contre la
 *  liste rendue, qui contient encore l'item traîné). */
export function moveKeyToVisualIndex(
  tiers: Tier[],
  key: string,
  tierId: string,
  vIndex: number,
): Tier[] {
  const ti = tiers.findIndex((t) => t.id === tierId);
  const oldPos = ti >= 0 ? tiers[ti].items.indexOf(key) : -1;
  // Retirer la clé d'abord décale d'un cran les positions suivantes du même tier.
  const target = oldPos >= 0 && oldPos < vIndex ? vIndex - 1 : vIndex;
  const cleaned = removeKey(tiers, key);
  const ci = cleaned.findIndex((t) => t.id === tierId);
  if (ci < 0) return cleaned;
  const items = [...cleaned[ci].items];
  items.splice(Math.max(0, Math.min(target, items.length)), 0, key);
  cleaned[ci] = { ...cleaned[ci], items };
  return cleaned;
}

/** Index d'insertion parmi les lignes de tier pour un Y de pointeur (0..count). */
export function rowIndexAtY(y: number): number {
  const rows = Array.from(document.querySelectorAll('[data-tier-id]'));
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i].getBoundingClientRect();
    if (y < r.top + r.height / 2) return i;
  }
  return rows.length;
}

/** Déplace la ligne `id` à l'index d'insertion `vIndex` ; rend la MÊME référence
 *  quand rien ne change (un drag en cours ne re-rend pas pour rien). */
export function moveRowToIndex(tiers: Tier[], id: string, vIndex: number): Tier[] {
  const from = tiers.findIndex((t) => t.id === id);
  if (from < 0) return tiers;
  const target = Math.max(0, Math.min(from < vIndex ? vIndex - 1 : vIndex, tiers.length - 1));
  if (target === from) return tiers;
  const next = [...tiers];
  const [row] = next.splice(from, 1);
  next.splice(target, 0, row);
  return next;
}

type DropTarget = { type: 'pool' } | { type: 'tier'; tierId: string; index: number };

/** Résout ce qui est sous le pointeur en cible de drop. Sert à l'indicateur
 *  d'insertion ET au drop réel — ils ne peuvent pas diverger. L'index est la
 *  position de trou parmi les items du tier. */
export function computeDrop(x: number, y: number): DropTarget | null {
  const el = document.elementFromPoint(x, y) as HTMLElement | null;
  const zone = el?.closest('[data-drop]');
  if (!zone) return null;
  if (zone.getAttribute('data-drop') === 'pool') return { type: 'pool' };
  const tierId = zone.getAttribute('data-tier-id');
  if (!tierId) return null;
  const box = zone.querySelector('[data-items]');
  const els = box ? Array.from(box.querySelectorAll<HTMLElement>('[data-item-key]')) : [];
  let index = els.length;
  for (let i = 0; i < els.length; i++) {
    const r = els[i].getBoundingClientRect();
    if (y < r.top) {
      index = i;
      break;
    }
    if (y <= r.bottom && x < r.left + r.width / 2) {
      index = i;
      break;
    }
  }
  return { type: 'tier', tierId, index };
}
