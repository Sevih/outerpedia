import { NextResponse } from 'next/server';
import { acceptTarget, acceptTypos } from '@/lib/admin/review-store';
import { IS_DEV } from '@/lib/admin/guard';
import { optionalJsonObject } from '@/lib/admin/route-body';

// Outil local : 403 en prod, écriture fichier seulement en dev.
// Corps optionnel `{ mode: 'typos' }` → n'applique QUE les corrections
// typographiques (sinon : valide toute l'extraction de la cible).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await optionalJsonObject<{ mode: string }>(req);
  try {
    if (body.mode === 'typos') {
      const fixed = await acceptTypos(id);
      return NextResponse.json({ ok: true, fixed });
    }
    await acceptTarget(id);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
