import { NextResponse } from 'next/server';
import { applyKitCuration, type KitCurationPatch } from '@/lib/admin/monster-skill-curated-store';
import { IS_DEV } from '@/lib/admin/guard';
import { jsonObjectBody } from '@/lib/admin/route-body';

// Outil local : 403 en prod, écriture fichier seulement en dev.
export async function POST(req: Request) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const parsed = await jsonObjectBody<KitCurationPatch>(req);
  if (!parsed.ok) return parsed.res;
  const body = parsed.body;
  const errors = await applyKitCuration(body);
  if (errors.length) return NextResponse.json({ ok: false, errors }, { status: 400 });
  return NextResponse.json({ ok: true });
}
