/**
 * Store des codes promo + bannières (couche curée éditable, ADMIN local).
 * Format hérité de la V2 tel quel ; V3 est la SOURCE DE VÉRITÉ depuis le
 * 21/07 (le « regen » d'import ponctuel depuis le repo V2 voisin a été retiré
 * une fois les fichiers à jour — décision Sevih).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeJson } from '@datagen/lib/json';

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

export const saveCoupons = (list: PromoCode[]): Promise<void> => writeArray(COUPONS_PATH, list);
export const saveBanners = (list: Banner[]): Promise<void> => writeArray(BANNER_PATH, list);
