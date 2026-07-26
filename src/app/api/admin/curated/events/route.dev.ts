import { NextResponse } from 'next/server';
import { saveEvents } from '@/lib/admin/events-store';
import { publishEvents } from '@/lib/admin/runtime-publish';
import { IS_DEV } from '@/lib/admin/guard';
import { jsonArrayBody } from '@/lib/admin/route-body';
import type { EventEntry } from '@/lib/data/events';

// Outil local : 403 en prod, écriture fichier seulement en dev. `saveEvents`
// valide avant d'écrire (200 { ok:false } → postJson relaie le message) ; la
// sauvegarde PUBLIE ensuite la copie runtime sur R2 — un événement part en prod
// sans redéploiement. Un échec de publication n'invalide pas l'écriture locale.
export async function POST(req: Request) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const parsed = await jsonArrayBody<EventEntry>(req);
  if (!parsed.ok) return parsed.res;
  const body = parsed.body;
  const errors = await saveEvents(body);
  if (errors.length) return NextResponse.json({ ok: false, errors }, { status: 400 });
  return NextResponse.json({ ok: true, publish: await publishEvents() });
}
