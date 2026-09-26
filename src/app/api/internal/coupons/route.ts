import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { runtimeJsonTag } from '@/lib/data/runtime-json';
import { refuseUnlessBearer } from '@/lib/internal-auth';
import { applyLiveCouponOp, readLiveCoupons } from '@/lib/data/live-coupons';
import { getItemEntry } from '@/lib/data/item-catalog';
import type { CouponOp, PromoCode } from '@/lib/data/promo-rules';

/**
 * Codes promo pour le STAFF, via le bot Discord (`/coupon add|edit|remove`).
 * Route INTERNE : réseau Docker seulement (Caddy la ferme à Internet), jeton
 * `COUPON_API_SECRET` partagé avec outerbot. Écrit la liste VIVANTE sur R2,
 * sous les mêmes règles que l'admin (`promo-rules`).
 *
 * GET  → la liste vivante, récompenses nommées (autocomplétion edit/remove).
 * POST → une opération `CouponOp` ; 400 si refusée, 409 si un autre écrivain
 *        l'a emporté trois fois de suite.
 */
export const dynamic = 'force-dynamic';

const SECRET = 'COUPON_API_SECRET';

/** Pages qui affichent les coupons : `/coupons` et l'accueil (codes actifs). */
const COUPON_PAGES = ['/[lang]/coupons', '/[lang]'] as const;

const rewardName = (id: string): string => getItemEntry(id)?.name.en ?? id;

export async function GET(request: Request) {
  const refused = refuseUnlessBearer(request, SECRET);
  if (refused) return refused;
  const { list } = await readLiveCoupons();
  return NextResponse.json(
    list.map((c) => ({
      code: c.code,
      start: c.start,
      end: c.end,
      rewards: Object.entries(c.description).map(([id, qty]) => ({
        id,
        name: rewardName(id),
        qty,
      })),
    })),
  );
}

const isStr = (v: unknown): v is string => typeof v === 'string';

/** Forme d'un coupon reçu du bot — le fond (dates, doublons) est à `promo-rules`. */
function asCoupon(v: unknown): PromoCode | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const c = v as Record<string, unknown>;
  const d = c.description;
  if (!isStr(c.code) || !isStr(c.start) || !isStr(c.end) || !d || typeof d !== 'object')
    return undefined;
  if (!Object.values(d).every(isStr)) return undefined;
  return { code: c.code, start: c.start, end: c.end, description: d as Record<string, string> };
}

function asOp(v: unknown): CouponOp | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  if (o.action === 'remove' && isStr(o.code)) return { action: 'remove', code: o.code };
  const coupon = asCoupon(o.coupon);
  if (!coupon) return undefined;
  if (o.action === 'add') return { action: 'add', coupon };
  if (o.action === 'edit' && isStr(o.code)) return { action: 'edit', code: o.code, coupon };
  return undefined;
}

/**
 * Récompenses d'un coupon entrant : l'id doit exister au catalogue, la quantité
 * être un nombre positif. L'admin ne l'exige pas (il édite l'historique tel
 * quel) ; ici, c'est ce qui garantit « aucune faute de frappe ». Les espaces
 * de milliers sont admis : deux anciens codes en portent (« 1 000 000 »), et un
 * `edit` qui ne touche que leurs dates garde leurs récompenses telles quelles.
 */
function rewardErrors(coupon: PromoCode): string[] {
  return Object.entries(coupon.description).flatMap(([id, qty]) => [
    ...(getItemEntry(id) ? [] : [`Unknown reward: ${id}.`]),
    ...(/^\d[\d ]*$/.test(qty) && Number(qty.replace(/ /g, '')) > 0
      ? []
      : [`Invalid quantity for ${rewardName(id)}: ${qty}.`]),
  ]);
}

export async function POST(request: Request) {
  const refused = refuseUnlessBearer(request, SECRET);
  if (refused) return refused;

  const op = asOp(await request.json().catch(() => undefined));
  if (!op) return NextResponse.json({ ok: false, errors: ['Malformed request.'] }, { status: 400 });

  if (op.action !== 'remove') {
    const errors = rewardErrors(op.coupon);
    if (errors.length) return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const res = await applyLiveCouponOp(op);
  if (!res.ok)
    return NextResponse.json(
      { ok: false, errors: res.errors },
      { status: res.conflict ? 409 : 400 },
    );

  // La purge Cloudflare ne vide que le CDN : ce process garde, lui, la lecture
  // de R2 ET les pages rendues (ISR) jusqu'à ~20 min. On les expire ici, tout
  // de suite, pour que « live on the site » soit vrai (constaté en recette :
  // edit sur R2, page inchangée une minute plus tard).
  revalidateTag(runtimeJsonTag('coupons.json'), { expire: 0 });
  for (const page of COUPON_PAGES) revalidatePath(page, 'page');
  return NextResponse.json({ ok: true, purged: res.purged });
}
