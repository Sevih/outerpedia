import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { IS_DEV } from '@/lib/admin/guard';
import { jsonArrayBody } from '@/lib/admin/route-body';

/**
 * Miroir FICHIER des scénarios du harnais (Sevih 10/08/2026) : le calculateur
 * en dev pousse ici sa liste localStorage à chaque changement (write-through,
 * DamageCalculatorBrowser) → `.dev/damage-scenarios.json` (gitignoré). Le
 * fichier ne porte que la CAPTURE (z + valeur en jeu + réglages de compte) —
 * calculé et Δ se REJOUENT depuis le z, jamais stockés. Lecteur : un agent /
 * un humain qui veut les scénarios sans copier-coller depuis le navigateur.
 * Route `.dev.ts` : inexistante en prod (pageExtensions), garde IS_DEV en plus.
 */
export async function POST(req: Request) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const parsed = await jsonArrayBody<unknown>(req);
  if (!parsed.ok) return parsed.res;
  const dir = path.join(process.cwd(), '.dev');
  await mkdir(dir, { recursive: true });
  await writeFile(
    path.join(dir, 'damage-scenarios.json'),
    `${JSON.stringify(parsed.body, null, 2)}\n`,
    'utf8',
  );
  return NextResponse.json({ ok: true, count: parsed.body.length });
}
