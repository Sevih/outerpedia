import { NextResponse } from 'next/server';
import { upsertEeCurated, type EeCuratedPatch } from '@/lib/admin/equipment-curated-store';
import { IS_DEV } from '@/lib/admin/guard';
import { jsonObjectBody } from '@/lib/admin/route-body';

// Outil local : 403 en prod, écriture fichier seulement en dev.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { id } = await params;
  const parsed = await jsonObjectBody<EeCuratedPatch>(req);
  if (!parsed.ok) return parsed.res;
  const body = parsed.body;
  const errors = await upsertEeCurated(id, body);
  if (errors.length) return NextResponse.json({ ok: false, errors }, { status: 400 });
  return NextResponse.json({ ok: true });
}
