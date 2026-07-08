/**
 * Store des codes promo + bannières (couche curée éditable, ADMIN local).
 * Format IDENTIQUE à V2 (aucune transformation) : le « regen » est une simple
 * copie du repo V2 voisin — une seule donnée à maintenir. V3 = source de vérité
 * une fois seedé ; le regen n'est qu'un import ponctuel (écrase).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { itemIdByName } from '@/lib/data/items';
import { goodsIdByName } from '@/lib/data/goods';

export interface PromoCode {
  code: string;
  /** nom de récompense → quantité (texte). */
  description: Record<string, string>;
  start: string;
  end: string;
}

export interface Banner {
  /** id perso (V2). */
  id: string;
  name: string;
  start: string;
  end: string;
}

const COUPONS_PATH = resolve(process.cwd(), 'data/curated/coupons.json');
const BANNER_PATH = resolve(process.cwd(), 'data/curated/banner.json');
// Repo V2 voisin (sibling de `outerpedia`). Lecture seule, dev only.
const V2_COUPONS = resolve(process.cwd(), '..', 'outerpedia-v2', 'data', 'coupons.json');
const V2_BANNER = resolve(process.cwd(), '..', 'outerpedia-v2', 'data', 'banner.json');

function readArray<T>(path: string): T[] {
  try {
    const data = JSON.parse(readFileSync(path, 'utf8'));
    return Array.isArray(data) ? (data as T[]) : [];
  } catch {
    return [];
  }
}

/** Lecture stricte (regen) : jette si absent/invalide → on n'écrase pas à vide. */
function readArrayStrict<T>(path: string): T[] {
  const data = JSON.parse(readFileSync(path, 'utf8'));
  if (!Array.isArray(data)) throw new Error(`${path} : tableau attendu`);
  return data as T[];
}

function writeArray(path: string, data: unknown): void {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

export const loadCoupons = (): PromoCode[] => readArray<PromoCode>(COUPONS_PATH);
export const loadBanners = (): Banner[] => readArray<Banner>(BANNER_PATH);

export const saveCoupons = (list: PromoCode[]): void => writeArray(COUPONS_PATH, list);
export const saveBanners = (list: Banner[]): void => writeArray(BANNER_PATH, list);

/**
 * Import des codes promo depuis V2 (écrase la copie V3). V2 stocke les rewards
 * par NOM ; on mappe vers l'id d'item (best-effort — nom non trouvé = gardé tel
 * quel, éditable ensuite dans le picker).
 */
export function regenCouponsFromV2(): PromoCode[] {
  const raw = readArrayStrict<PromoCode>(V2_COUPONS);
  const nameToId = itemIdByName();
  // Les monnaies (goods) complètent l'index — sans écraser un item homonyme.
  for (const [n, id] of goodsIdByName()) if (!nameToId.has(n)) nameToId.set(n, id);
  const mapped = raw.map((c) => ({
    ...c,
    description: Object.fromEntries(
      Object.entries(c.description ?? {}).map(([name, qty]) => [
        nameToId.get(name.trim().toLowerCase()) ?? name,
        qty,
      ]),
    ),
  }));
  writeArray(COUPONS_PATH, mapped);
  return mapped;
}
export function regenBannersFromV2(): Banner[] {
  const data = readArrayStrict<Banner>(V2_BANNER);
  writeArray(BANNER_PATH, data);
  return data;
}
