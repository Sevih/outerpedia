import { NextResponse } from 'next/server';
import { saveBanners, type Banner } from '@/lib/admin/promo-banner-store';
import { publishBanners } from '@/lib/admin/runtime-publish';
import { IS_DEV } from '@/lib/admin/guard';
import { jsonArrayBody } from '@/lib/admin/route-body';

// Outil local : 403 en prod, écriture fichier seulement en dev. La sauvegarde
// PUBLIE aussi la copie runtime sur R2 (une bannière part en prod sans
// redéploiement) ; un échec de publication n'invalide pas l'écriture locale —
// il est relayé.
export async function POST(req: Request) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const parsed = await jsonArrayBody<Banner>(req);
  if (!parsed.ok) return parsed.res;
  const body = parsed.body;
  const errors = await saveBanners(body);
  if (errors.length) return NextResponse.json({ ok: false, errors }, { status: 400 });
  return NextResponse.json({ ok: true, publish: await publishBanners() });
}
