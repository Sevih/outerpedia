import { NextResponse } from 'next/server';
import { IS_DEV } from '@/lib/admin/guard';
import { fetchMeta } from '@/lib/admin/youtube';

// Outil local : 403 en prod, enrichit un id YouTube déjà connu (saisi à la main).
export async function GET(req: Request) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const ids = (new URL(req.url).searchParams.get('ids') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!ids.length) return NextResponse.json({ error: 'paramètre ids requis' }, { status: 400 });

  try {
    const meta = await fetchMeta(ids);
    return NextResponse.json({ meta });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
