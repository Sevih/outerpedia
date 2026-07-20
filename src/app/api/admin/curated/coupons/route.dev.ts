import { NextResponse } from 'next/server';
import { saveCoupons, type PromoCode } from '@/lib/admin/promo-banner-store';
import { publishCoupons } from '@/lib/admin/coupons-publish';
import { IS_DEV } from '@/lib/admin/guard';

// Outil local : 403 en prod, écriture fichier seulement en dev. La sauvegarde
// PUBLIE aussi la copie runtime sur R2 (un code part en prod sans redéploiement) ;
// un échec de publication n'invalide pas l'écriture locale — il est relayé.
export async function POST(req: Request) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = (await req.json()) as PromoCode[];
  if (!Array.isArray(body))
    return NextResponse.json({ ok: false, errors: ['tableau attendu'] }, { status: 400 });
  await saveCoupons(body);
  return NextResponse.json({ ok: true, publish: await publishCoupons() });
}
