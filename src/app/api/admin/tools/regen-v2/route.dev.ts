import { NextResponse } from 'next/server';
import { regenChangelogFromV2 } from '@/lib/admin/changelog-store';
import { IS_DEV } from '@/lib/admin/guard';

// Import ponctuel depuis le repo V2 voisin (écrase la copie V3). Dev only.
// Ne reste que le CHANGELOG : coupons/banners retirés le 21/07 (fichiers à
// jour, V3 = source de vérité — décision Sevih).
export async function POST(req: Request) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { kind } = (await req.json()) as { kind?: string };
  try {
    if (kind === 'changelog')
      return NextResponse.json({ ok: true, data: await regenChangelogFromV2() });
    return NextResponse.json({ ok: false, error: 'kind inconnu' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
