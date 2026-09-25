import { NextResponse } from 'next/server';
import { saveCouponsLive, type PromoCode } from '@/lib/admin/promo-banner-store';
import { IS_DEV } from '@/lib/admin/guard';
import { jsonObjectBody } from '@/lib/admin/route-body';

// Outil local : 403 en prod. La liste VIVANTE est sur R2 (le staff en ajoute
// depuis Discord) : l'écriture est conditionnelle au jeton `etag` rendu par la
// page, et un conflit (409) n'écrit RIEN — l'éditeur demande de recharger.
export async function POST(req: Request) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const parsed = await jsonObjectBody<{ list?: unknown; etag?: unknown }>(req);
  if (!parsed.ok) return parsed.res;
  const { list, etag } = parsed.body;
  if (!Array.isArray(list) || typeof etag !== 'string' || !etag)
    return NextResponse.json(
      { ok: false, errors: ['{ list: PromoCode[], etag: string } attendu.'] },
      { status: 400 },
    );
  const res = await saveCouponsLive(list as PromoCode[], etag);
  if (!res.ok)
    return NextResponse.json(
      { ok: false, conflict: res.conflict, errors: res.errors },
      { status: res.conflict ? 409 : 400 },
    );
  return NextResponse.json(res);
}
