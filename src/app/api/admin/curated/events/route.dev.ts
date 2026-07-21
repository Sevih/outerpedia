import { NextResponse } from 'next/server';
import { saveEvents } from '@/lib/admin/events-store';
import { publishEvents } from '@/lib/admin/runtime-publish';
import { IS_DEV } from '@/lib/admin/guard';
import type { EventEntry } from '@/lib/data/events';

// Outil local : 403 en prod, écriture fichier seulement en dev. `saveEvents`
// valide avant d'écrire (200 { ok:false } → postJson relaie le message) ; la
// sauvegarde PUBLIE ensuite la copie runtime sur R2 — un événement part en prod
// sans redéploiement. Un échec de publication n'invalide pas l'écriture locale.
export async function POST(req: Request) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = (await req.json()) as EventEntry[];
  if (!Array.isArray(body))
    return NextResponse.json({ ok: false, errors: ['tableau attendu'] }, { status: 400 });
  const errors = await saveEvents(body);
  if (errors.length) return NextResponse.json({ ok: false, errors }, { status: 400 });
  return NextResponse.json({ ok: true, publish: await publishEvents() });
}
