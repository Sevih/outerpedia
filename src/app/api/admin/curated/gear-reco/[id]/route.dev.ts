import { NextResponse } from 'next/server';
import type { GearBuild } from '@contracts';
import { upsertGearReco } from '@/lib/admin/gear-reco-store';
import { IS_DEV } from '@/lib/admin/guard';

// Outil local : 403 en prod, écriture fichier seulement en dev.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { id } = await params;
  const body = (await req.json()) as GearBuild[];
  const errors = await upsertGearReco(id, body);
  if (errors.length) return NextResponse.json({ ok: false, errors }, { status: 400 });
  return NextResponse.json({ ok: true });
}
