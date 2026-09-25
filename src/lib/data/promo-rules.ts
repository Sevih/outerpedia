/**
 * RÈGLES des codes promo et des bannières — cœur PUR, sans fichier ni réseau.
 *
 * Séparé du store admin (`lib/admin/promo-banner-store`, qui écrit le fichier
 * local) depuis que les coupons s'écrivent AUSSI en prod : la route interne du
 * bot Discord (`/api/internal/coupons`) valide avec ces mêmes règles, et la
 * liste vivante est sur R2 (cf. `lib/data/live-coupons`).
 */

export interface PromoCode {
  code: string;
  /** nom de récompense → quantité (texte). */
  description: Record<string, string>;
  start: string;
  end: string;
}

export interface Banner {
  /** id perso (champ hérité). */
  id: string;
  name: string;
  start: string;
  end: string;
}

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

/** Une opération sur la liste vivante (bot Discord, `/coupon add|edit|remove`). */
export type CouponOp =
  | { action: 'add'; coupon: PromoCode }
  | { action: 'edit'; code: string; coupon: PromoCode }
  | { action: 'remove'; code: string };

/**
 * Applique une opération à la liste. Renvoie la nouvelle liste, ou les écarts
 * BLOQUANTS : code inconnu (edit/remove), code déjà pris (add, ou edit qui
 * renomme vers un code existant), puis `validateCoupons` sur la liste entière.
 * Le code est comparé TEL QUEL, espaces de bord retirés : un code du jeu est
 * sensible à la casse.
 */
export function applyCouponOp(
  list: PromoCode[],
  op: CouponOp,
): { ok: true; list: PromoCode[] } | { ok: false; errors: string[] } {
  const has = (code: string) => list.some((c) => c.code === code);
  const clean = (c: PromoCode): PromoCode => ({ ...c, code: c.code.trim() });

  let next: PromoCode[];
  if (op.action === 'add') {
    const coupon = clean(op.coupon);
    if (has(coupon.code)) return { ok: false, errors: [`Code ${coupon.code} already exists.`] };
    next = [coupon, ...list];
  } else {
    const code = op.code.trim();
    if (!has(code)) return { ok: false, errors: [`Code ${code} not found.`] };
    if (op.action === 'remove') {
      next = list.filter((c) => c.code !== code);
    } else {
      const coupon = clean(op.coupon);
      if (coupon.code !== code && has(coupon.code))
        return { ok: false, errors: [`Code ${coupon.code} already exists.`] };
      next = list.map((c) => (c.code === code ? coupon : c));
    }
  }

  const errors = validateCoupons(next);
  return errors.length ? { ok: false, errors } : { ok: true, list: next };
}
