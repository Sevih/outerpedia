import { NextResponse } from 'next/server';
import { regenBannersFromV2, regenCouponsFromV2 } from '@/lib/admin/promo-banner-store';
import { IS_DEV } from '@/lib/admin/guard';

// Import ponctuel depuis le repo V2 voisin (écrase la copie V3). Dev only.
export async function POST(req: Request) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { kind } = (await req.json()) as { kind?: string };
  try {
    if (kind === 'coupons') return NextResponse.json({ ok: true, data: regenCouponsFromV2() });
    if (kind === 'banners') return NextResponse.json({ ok: true, data: regenBannersFromV2() });
    return NextResponse.json({ ok: false, error: 'kind inconnu' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
