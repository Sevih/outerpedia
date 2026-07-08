import { NextResponse } from 'next/server';
import { upsertItemCurated, type ItemCurated } from '@/lib/admin/item-curated-store';
import { IS_DEV } from '@/lib/admin/guard';

// Outil local : 403 en prod, écriture fichier seulement en dev.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;
  const body = (await req.json()) as ItemCurated;
  upsertItemCurated(id, body);
  return NextResponse.json({ ok: true });
}
