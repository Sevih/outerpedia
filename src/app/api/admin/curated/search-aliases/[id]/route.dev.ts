import { NextResponse } from 'next/server';
import { upsertSearchAliases } from '@/lib/admin/search-alias-store';
import { IS_DEV } from '@/lib/admin/guard';
import { jsonArrayBody } from '@/lib/admin/route-body';

// Outil local : 403 en prod, écriture fichier seulement en dev.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { id } = await params;
  const parsed = await jsonArrayBody<string>(req);
  if (!parsed.ok) return parsed.res;
  const errors = await upsertSearchAliases(id, parsed.body);
  if (errors.length) return NextResponse.json({ ok: false, errors }, { status: 400 });
  return NextResponse.json({ ok: true });
}
