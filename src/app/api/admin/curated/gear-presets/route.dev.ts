import { NextResponse } from 'next/server';
import type { GearPresets } from '@contracts';
import { saveGearPresets } from '@/lib/admin/gear-presets-store';
import { IS_DEV } from '@/lib/admin/guard';
import { jsonObjectBody } from '@/lib/admin/route-body';

// Outil local : 403 en prod, écriture fichier seulement en dev.
export async function POST(req: Request) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const parsed = await jsonObjectBody<GearPresets>(req);
  if (!parsed.ok) return parsed.res;
  const body = parsed.body;
  const errors = await saveGearPresets(body);
  if (errors.length) return NextResponse.json({ ok: false, errors }, { status: 400 });
  return NextResponse.json({ ok: true });
}
