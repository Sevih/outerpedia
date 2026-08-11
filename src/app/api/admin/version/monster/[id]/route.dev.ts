import { NextResponse } from 'next/server';
import { versionMonster } from '@/lib/admin/review-store';
import { IS_DEV } from '@/lib/admin/guard';
import { optionalJsonObject } from '@/lib/admin/route-body';
import { applyRepin, planRepin } from '@/lib/admin/repin-guides';

/**
 * Outil local : 403 en prod. Bouton « Versionner » de l'admin, DEUX gestes qui
 * ne vont pas l'un sans l'autre :
 *   1. FIGER l'état committé (git HEAD) du monstre dans
 *      `data/generated/monster-archive/<id>@<n>.json` ;
 *   2. RÉ-ÉPINGLER les guides qui le nommaient encore en live vers `<id>@<n>`.
 *
 * Sans le second, l'archive existe mais personne ne la regarde : les guides
 * continuent de pointer l'id vivant, donc l'ancien guide affiche le NOUVEAU
 * boss — exactement ce que versionner cherche à éviter.
 *
 * Le ré-épinglage vient APRÈS l'archive, et seulement si elle s'est écrite : on
 * ne fait pas pointer des guides vers un fichier qui n'existe pas (le rendu
 * lèverait). Il ne couvre que les références DIRECTES ; celles qui passent par un
 * combat sont rendues dans `pending`, à traiter par la liste `pinned` des guides
 * versionnés. Elles sont dites, jamais tues.
 *
 * Body optionnel : `{ label?: string, repin?: false }` — `repin: false` versionne
 * sans toucher aux guides (rattrapage, ou pour inspecter le plan d'abord).
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await optionalJsonObject<{ label: string; repin: boolean }>(req);
  try {
    const report = await versionMonster(id, { label: body.label?.trim() || undefined });
    if (body.repin === false) {
      return NextResponse.json({ ok: true, report, repin: planRepin(id, report.key) });
    }
    const repin = await applyRepin(planRepin(id, report.key));
    return NextResponse.json({ ok: true, report, repin });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
