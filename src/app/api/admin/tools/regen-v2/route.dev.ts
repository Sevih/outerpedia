import { NextResponse } from 'next/server';
import { regenBannersFromV2, regenCouponsFromV2 } from '@/lib/admin/promo-banner-store';
import { regenChangelogFromV2 } from '@/lib/admin/changelog-store';
import { publishCoupons } from '@/lib/admin/coupons-publish';
import { IS_DEV } from '@/lib/admin/guard';

// Import ponctuel depuis le repo V2 voisin (écrase la copie V3). Dev only.
export async function POST(req: Request) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { kind } = (await req.json()) as { kind?: string };
  try {
    // Le regen coupons réécrit le fichier → republie la copie runtime R2 aussi.
    if (kind === 'coupons') {
      const data = await regenCouponsFromV2();
      return NextResponse.json({ ok: true, data, publish: await publishCoupons() });
    }
    if (kind === 'banners')
      return NextResponse.json({ ok: true, data: await regenBannersFromV2() });
    if (kind === 'changelog')
      return NextResponse.json({ ok: true, data: await regenChangelogFromV2() });
    return NextResponse.json({ ok: false, error: 'kind inconnu' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
