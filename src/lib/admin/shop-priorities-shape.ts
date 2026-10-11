/**
 * FORME des priorités de shop — ce que l'éditeur de l'admin (`ShopBlocks`,
 * `ShopPrioritiesEditor`) portait en React et que quick doit connaître aussi,
 * sans aucune I/O : l'ordre et les libellés des sept shops dérivés du jeu, les
 * priorités, les périodes, et l'OVERLAY tiré des lignes dérivées — ce que
 * `saveShopPriorities` reçoit (`slug → priorité/notes`), que l'éditeur React
 * reconstruisait dans son `useState` au montage.
 *
 * Module volontairement PUR (ni `node:fs`, ni store) : il est importé des deux
 * côtés — la brique React de l'admin et `scripts/quick/actions.ts`.
 */
import type { LocalizedText } from '@contracts';

export type Priority = 'S' | 'A' | 'B' | 'C';
export const PRIORITIES: readonly Priority[] = ['S', 'A', 'B', 'C'];
export const PERIODS = ['daily', 'weekly', 'monthly', 'one-time'] as const;
export type Period = (typeof PERIODS)[number];

/** Onglets dérivés (dans l'ordre du guide) et leur libellé. */
export const DERIVED_ORDER: readonly string[] = [
  'guild',
  'joint',
  'friend',
  'arena',
  'stars',
  'worldboss',
  'survey',
];
export const DERIVED_LABEL: Record<string, string> = {
  guild: 'Guild',
  joint: 'Joint Challenge',
  friend: 'Friendship',
  arena: 'Arena',
  stars: "Star's Memory",
  worldboss: 'World Boss',
  survey: 'Survey Hub',
};

/** Les shops ÉDITORIAUX en texte (Supply, Rico) et leur libellé. */
export const TEXT_SHOP_LABEL: Record<string, string> = {
  supply: 'Supply Module',
  rico: 'Rico Secret',
};

/** Un texte localisé porte-t-il quelque chose ? */
const hasText = (t?: LocalizedText): boolean =>
  t ? Object.values(t).some((v) => typeof v === 'string' && v.trim()) : false;

/** Ce qu'une ligne dérivée porte d'éditable : sa clé stable, la priorité, les notes. */
export interface OverlayRow {
  key: string;
  priority?: Priority;
  notes?: LocalizedText;
}

/**
 * L'overlay des dérivés, tiré des lignes montrées : `slug → { priority, notes }`,
 * une ligne sans priorité ni note n'y figure PAS — c'est ainsi que le store la
 * retire du curé (« une entrée vide = clé supprimée »). Les clés hors rotation,
 * que l'éditeur ne montre pas, ne sont pas ici : le store les PRÉSERVE.
 */
export function overlayOf(
  shops: readonly { rows: readonly OverlayRow[] }[],
): Record<string, { priority?: Priority; notes?: LocalizedText }> {
  const out: Record<string, { priority?: Priority; notes?: LocalizedText }> = {};
  for (const shop of shops)
    for (const r of shop.rows) {
      const entry: { priority?: Priority; notes?: LocalizedText } = {};
      if (r.priority && PRIORITIES.includes(r.priority)) entry.priority = r.priority;
      if (hasText(r.notes)) entry.notes = r.notes;
      if (Object.keys(entry).length) out[r.key] = entry;
    }
  return out;
}
