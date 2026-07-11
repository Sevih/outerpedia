import { NextResponse } from 'next/server';
import { integrateMonsterMode } from '@/lib/admin/review-store';
import { IS_DEV } from '@/lib/admin/guard';

// Outil local : 403 en prod. Enregistre TOUS les monstres d'un MODE DE JEU
// (spawnés dans ses donjons + adds rattachés) sur clic admin.
export async function POST(_req: Request, { params }: { params: Promise<{ mode: string }> }) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { mode } = await params;
  try {
    const report = await integrateMonsterMode(mode);
    return NextResponse.json({ ok: true, report });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
