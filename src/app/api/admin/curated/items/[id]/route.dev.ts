import { NextResponse } from 'next/server';
import {
  bakeItemCatalogEntry,
  upsertItemCurated,
  type ItemCurated,
} from '@/lib/admin/item-curated-store';
import { IS_DEV } from '@/lib/admin/guard';

// Outil local : 403 en prod, écriture fichier seulement en dev.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;
  const body = (await req.json()) as ItemCurated;
  upsertItemCurated(id, body);
  // Rebake immédiat de l'entrée servie : l'édition curée vaut validation (la
  // donnée jeu sous-jacente n'a pas bougé) — rien à promouvoir pour la voir.
  try {
    await bakeItemCatalogEntry(id);
  } catch (e) {
    return NextResponse.json(
      { errors: [`curé enregistré, mais rebake items.json échoué : ${(e as Error).message}`] },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
