/**
 * Store des codes promo + bannières (couche curée éditable, ADMIN local).
 * Format hérité de la V2 tel quel ; V3 est la SOURCE DE VÉRITÉ depuis le
 * 21/07 (le « regen » d'import ponctuel depuis le repo V2 voisin a été retiré
 * une fois les fichiers à jour — décision Sevih).
 *
 * `validateCoupons` / `validateBanners` sont les cœurs PURS (testés) : ils
 * décrivent ce qui rend une entrée publiable. Ces deux surfaces écrivaient sans
 * AUCUNE garde jusqu'à l'audit F10 — elles étaient les seules des 16 stores dans
 * ce cas, alors même que leur sauvegarde publie sur R2.
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

/** Date de calendrier du jeu — `YYYY-MM-DD`, comme le changelog. */
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Écarts BLOQUANTS communs aux deux surfaces : une période sans date lisible ne
 * peut pas être comparée à « aujourd'hui », donc le rendu ne sait plus si
 * l'entrée est active. Les dates sont comparées en TEXTE : le format
 * `YYYY-MM-DD` est ordonnable tel quel, et ça évite un décalage de fuseau.
 */
function validatePeriod(at: string, start: string, end: string, errors: string[]): void {
  if (!DATE_RE.test(start ?? '')) errors.push(`${at}: invalid start date (YYYY-MM-DD expected).`);
  if (!DATE_RE.test(end ?? '')) errors.push(`${at}: invalid end date (YYYY-MM-DD expected).`);
  if (DATE_RE.test(start ?? '') && DATE_RE.test(end ?? '') && end < start)
    errors.push(`${at}: end date precedes start date.`);
}

/**
 * Valide les codes promo. Renvoie les écarts BLOQUANTS (vide = publiable).
 *
 * Même raison qu'`events-store` : la sauvegarde PUBLIE sur R2 (cf. la route), donc
 * un coupon cassé part en prod — il faut l'arrêter à l'écriture, pas au rendu.
 * Le CODE est unique parce qu'il est l'identité de l'entrée : deux lignes pour le
 * même code, et la période affichée devient un tirage au sort.
 * (Vérifié sur les 91 coupons committés au 26/07 : tous passent ces règles.)
 */
export function validateCoupons(list: PromoCode[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();

  list.forEach((c, i) => {
    const code = c.code?.trim();
    const at = `Coupon ${i + 1} (${code || '?'})`;
    if (!code) errors.push(`${at}: code is required.`);
    else if (seen.has(code)) errors.push(`${at}: duplicate code.`);
    else seen.add(code);

    validatePeriod(at, c.start, c.end, errors);
    if (!c.description || !Object.keys(c.description).length)
      errors.push(`${at}: at least one reward is required.`);
  });

  return errors;
}

/**
 * Valide les bannières. Renvoie les écarts BLOQUANTS (vide = publiable).
 *
 * PAS d'unicité sur l'`id` — contrairement aux coupons : un personnage revient
 * légitimement en bannière (rerun), et 19 des 48 bannières committées au 26/07
 * sont dans ce cas. Ce qui compte est que la période soit lisible.
 */
export function validateBanners(list: Banner[]): string[] {
  const errors: string[] = [];

  list.forEach((b, i) => {
    const at = `Banner ${i + 1} (${b.name?.trim() || '?'})`;
    if (!String(b.id ?? '').trim()) errors.push(`${at}: character id is required.`);
    if (!b.name?.trim()) errors.push(`${at}: name is required.`);
    validatePeriod(at, b.start, b.end, errors);
  });

  return errors;
}

/** Valide puis écrit. Renvoie les écarts bloquants (vide = OK, écrit). */
export async function saveCoupons(list: PromoCode[]): Promise<string[]> {
  const errors = validateCoupons(list);
  if (errors.length) return errors;
  await writeArray(COUPONS_PATH, list);
  return [];
}

/** Valide puis écrit. Renvoie les écarts bloquants (vide = OK, écrit). */
export async function saveBanners(list: Banner[]): Promise<string[]> {
  const errors = validateBanners(list);
  if (errors.length) return errors;
  await writeArray(BANNER_PATH, list);
  return [];
}
