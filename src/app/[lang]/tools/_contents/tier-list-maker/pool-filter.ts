/**
 * Filtre du POOL du Tier List Maker, en fonction PURE (extrait de `use-pool.ts`
 * pour être testé), et la construction du texte cherchable d'un item.
 *
 * La recherche compare la saisie à `TierItem.search`, calculé côté SERVEUR à la
 * construction des pools : nom complet (titre compris — « Demiurge », « Core
 * Fusion »), nom court, et pour un costume ou un EE le nom complet de son perso.
 * Les deux bouts passent par `normalizeSearchText` (accents, casse, pleine
 * chasse) : une normalisation d'un seul côté rendrait des noms introuvables.
 */
import { normalizeSearchText } from '@/lib/search-text';
import type { TierItem } from './contracts';

/**
 * Texte cherchable d'un item : chaque nom normalisé, espaces réduits à un seul,
 * et un nom déjà contenu MOT POUR MOT dans ce qui précède est sauté (« luna »
 * après « demiurge luna »). Dédoublonner mot à mot couperait les noms
 * composés : « round-the-clock tourist luna » suivi de « demiurge luna »
 * deviendrait « … luna demiurge », et le nom complet de la base, introuvable.
 */
export function buildSearchText(...names: (string | null | undefined)[]): string {
  let acc = '';
  for (const name of names) {
    if (!name) continue;
    const norm = normalizeSearchText(name).split(/\s+/).filter(Boolean).join(' ');
    if (!norm || ` ${acc} `.includes(` ${norm} `)) continue;
    acc = acc ? `${acc} ${norm}` : norm;
  }
  return acc;
}

export interface PoolFilterOptions {
  /** Saisie DÉJÀ normalisée (`normalizeSearchText`) ; vide = pas de filtre. */
  q: string;
  /** Clés déjà rangées dans une ligne. */
  placed: Set<string>;
  skinsOnly: boolean;
  showSkins: boolean;
  elementFilter: string[];
  classFilter: string[];
  rarityFilter: number[];
  tagFilter: string[];
}

export function poolFilter(
  items: TierItem[],
  {
    q,
    placed,
    skinsOnly,
    showSkins,
    elementFilter,
    classFilter,
    rarityFilter,
    tagFilter,
  }: PoolFilterOptions,
): TierItem[] {
  return items.filter((it) => {
    if (placed.has(it.key)) return false;
    // « Skins seulement » outrepasse le masquage par défaut des skins : le
    // filtre marche même quand le réglage est décoché.
    if (skinsOnly) {
      if (!it.isSkin) return false;
    } else if (it.isSkin && !showSkins) return false;
    if (elementFilter.length && (!it.element || !elementFilter.includes(it.element))) return false;
    if (classFilter.length && (!it.cls || !classFilter.includes(it.cls))) return false;
    if (rarityFilter.length && (it.rarity === undefined || !rarityFilter.includes(it.rarity)))
      return false;
    if (tagFilter.length && !it.tags?.some((tg) => tagFilter.includes(tg))) return false;
    if (q && !it.search.includes(q)) return false;
    return true;
  });
}
