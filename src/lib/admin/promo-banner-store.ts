/**
 * Store des codes promo + bannières (couche curée éditable, ADMIN local).
 * Format hérité tel quel.
 *
 * SOURCE DE VÉRITÉ : ce repo pour les bannières. Pour les COUPONS, c'est R2
 * depuis le 25/09/2026 (le staff les ajoute aussi depuis Discord) : le fichier
 * `data/curated/coupons.json` n'est plus qu'un INSTANTANÉ, rafraîchi quand
 * l'admin charge la liste vivante (cf. `lib/data/live-coupons`).
 *
 * `validateCoupons` / `validateBanners` sont les cœurs PURS (testés), dans
 * `lib/data/promo-rules`. Ces deux surfaces écrivaient sans AUCUNE garde
 * jusqu'à l'audit F10 — elles étaient les seules des 16 stores dans ce cas,
 * alors même que leur sauvegarde publie sur R2.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeJson } from '@datagen/lib/json';
import { readLiveCoupons, writeLiveCoupons, type WriteResult } from '@/lib/data/live-coupons';
import {
  validateBanners,
  validateCoupons,
  type Banner,
  type PromoCode,
} from '@/lib/data/promo-rules';

// Règles et types déplacés dans `lib/data/promo-rules` (prod aussi) ; ré-exportés
// pour les appelants admin existants.
export { validateBanners, validateCoupons, type Banner, type PromoCode };

const COUPONS_PATH = resolve(process.cwd(), 'data/curated/coupons.json');
const BANNER_PATH = resolve(process.cwd(), 'data/curated/banner.json');

function readArray<T>(path: string): T[] {
  try {
    const data = JSON.parse(readFileSync(path, 'utf8'));
    return Array.isArray(data) ? (data as T[]) : [];
  } catch {
    return [];
  }
}

// Format CANONIQUE (`writeJson`) — sinon chaque édition reformate tout le fichier.
function writeArray(path: string, data: unknown): Promise<void> {
  return writeJson(path, data);
}

export const loadCoupons = (): PromoCode[] => readArray<PromoCode>(COUPONS_PATH);
export const loadBanners = (): Banner[] => readArray<Banner>(BANNER_PATH);

/**
 * Liste VIVANTE (R2) pour l'éditer, avec son jeton de version. Rafraîchit au
 * passage l'instantané local — c'est ainsi que les codes ajoutés par le staff
 * entrent dans git. Si R2 est illisible, rend l'instantané SANS jeton :
 * l'éditeur l'affiche mais refuse d'enregistrer (il écraserait à l'aveugle).
 */
export async function loadCouponsForEdit(): Promise<{
  list: PromoCode[];
  etag: string | null;
  error?: string;
}> {
  try {
    const live = await readLiveCoupons();
    await writeArray(COUPONS_PATH, live.list);
    return live;
  } catch (e) {
    return { list: loadCoupons(), etag: null, error: `R2 unreadable: ${(e as Error).message}` };
  }
}

/**
 * Enregistre la liste entière sur R2 si personne ne l'a modifiée depuis
 * `etag`, puis l'instantané local. Un conflit n'écrit RIEN : l'appelant
 * recharge (ses modifs non enregistrées sont à refaire, l'ajout de l'autre est
 * sauf).
 */
export async function saveCouponsLive(list: PromoCode[], etag: string): Promise<WriteResult> {
  const res = await writeLiveCoupons(list, etag);
  if (res.ok) await writeArray(COUPONS_PATH, list);
  return res;
}

/** Valide puis écrit. Renvoie les écarts bloquants (vide = OK, écrit). */
export async function saveBanners(list: Banner[]): Promise<string[]> {
  const errors = validateBanners(list);
  if (errors.length) return errors;
  await writeArray(BANNER_PATH, list);
  return [];
}
