import { NextResponse } from 'next/server';
import { versionMonster } from '@/lib/admin/review-store';
import { IS_DEV } from '@/lib/admin/guard';

/**
 * Outil local : 403 en prod. FIGE l'état committé (git HEAD) d'un monstre dans
 * `data/generated/monster-archive/<id>@<n>.json` — bouton « Versionner » de
 * l'admin. Body optionnel : `{ label?: string }`.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { label?: string };
  try {
    const report = await versionMonster(id, { label: body.label?.trim() || undefined });
    return NextResponse.json({ ok: true, report });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
