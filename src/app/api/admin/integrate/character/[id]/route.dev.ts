import { NextResponse } from 'next/server';
import { integrateCharacter } from '@/lib/admin/review-store';
import { IS_DEV } from '@/lib/admin/guard';

// Outil local : 403 en prod. Intègre UN perso (données + images) sur clic admin.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { id } = await params;
  try {
    const report = await integrateCharacter(id);
    return NextResponse.json({ ok: true, report });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
