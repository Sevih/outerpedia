import { NextResponse } from 'next/server';
import { saveChangelog } from '@/lib/admin/changelog-store';
import type { ChangelogEntry } from '@/lib/data/changelog';
import { IS_DEV } from '@/lib/admin/guard';

// Outil local : 403 en prod, écriture fichier seulement en dev. `saveChangelog`
// valide avant d'écrire et renvoie les erreurs bloquantes (200 { ok:false } →
// postJson jette côté client avec le message).
export async function POST(req: Request) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = (await req.json()) as ChangelogEntry[];
  if (!Array.isArray(body))
    return NextResponse.json({ ok: false, errors: ['tableau attendu'] }, { status: 400 });
  const errors = await saveChangelog(body);
  if (errors.length) return NextResponse.json({ ok: false, errors }, { status: 400 });
  return NextResponse.json({ ok: true });
}
