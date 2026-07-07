import { NextResponse } from 'next/server';
import { IS_DEV } from '@/lib/admin/guard';
import { searchOfficial } from '@/lib/admin/youtube';

// Outil local : 403 en prod, appel API YouTube seulement en dev.
export async function GET(req: Request) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const q = new URL(req.url).searchParams.get('q')?.trim();
  if (!q) return NextResponse.json({ error: 'paramètre q requis' }, { status: 400 });

  try {
    const candidates = await searchOfficial(q);
    return NextResponse.json({ candidates });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
