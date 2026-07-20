import { NextResponse } from 'next/server';
import { upsertSearchAliases } from '@/lib/admin/search-alias-store';
import { IS_DEV } from '@/lib/admin/guard';

// Outil local : 403 en prod, écriture fichier seulement en dev.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  if (!Array.isArray(body))
    return NextResponse.json({ ok: false, errors: ['expected an array of aliases.'] }, { status: 400 }); // prettier-ignore
  const errors = await upsertSearchAliases(id, body as string[]);
  if (errors.length) return NextResponse.json({ ok: false, errors }, { status: 400 });
  return NextResponse.json({ ok: true });
}
