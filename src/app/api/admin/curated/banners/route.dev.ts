import { NextResponse } from 'next/server';
import { saveBanners, type Banner } from '@/lib/admin/promo-banner-store';
import { IS_DEV } from '@/lib/admin/guard';

// Outil local : 403 en prod, écriture fichier seulement en dev.
export async function POST(req: Request) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = (await req.json()) as Banner[];
  if (!Array.isArray(body))
    return NextResponse.json({ ok: false, errors: ['tableau attendu'] }, { status: 400 });
  await saveBanners(body);
  return NextResponse.json({ ok: true });
}
