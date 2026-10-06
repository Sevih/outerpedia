import { NextResponse } from 'next/server';
import { acceptMinor, acceptTarget } from '@/lib/admin/review-store';
import { IS_DEV } from '@/lib/admin/guard';
import { optionalJsonObject } from '@/lib/admin/route-body';

// Outil local : 403 en prod, écriture fichier seulement en dev.
// Corps optionnel `{ mode: 'minor' }` → n'applique QUE les retouches mineures
// et les corrections typographiques (sinon : valide toute l'extraction de la
// cible). Les deux rendent `assets` (images mises en place) sur les cibles des
// persos, des monstres et de l'équipement ; `minor` rend aussi le compte
// d'entités appliquées par sorte.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await optionalJsonObject<{ mode: string }>(req);
  try {
    if (body.mode === 'minor') {
      const report = await acceptMinor(id);
      return NextResponse.json({ ok: true, ...report });
    }
    const report = await acceptTarget(id);
    return NextResponse.json({ ok: true, ...report });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
