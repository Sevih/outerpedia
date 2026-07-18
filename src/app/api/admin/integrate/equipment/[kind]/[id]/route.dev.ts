import { NextResponse } from 'next/server';
import { integrateEquipment, type EquipmentEntityKind } from '@/lib/admin/review-store';
import { IS_DEV } from '@/lib/admin/guard';

const KINDS: EquipmentEntityKind[] = ['weapon', 'accessory', 'talisman', 'ee', 'set'];

// Outil local : 403 en prod. Intègre UNE entité d'équipement (données + images).
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ kind: string; id: string }> },
) {
  if (!IS_DEV) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { kind, id } = await params;
  if (!KINDS.includes(kind as EquipmentEntityKind)) {
    return NextResponse.json({ error: `kind inconnu : ${kind}` }, { status: 400 });
  }
  try {
    const report = await integrateEquipment(kind as EquipmentEntityKind, decodeURIComponent(id));
    return NextResponse.json({ ok: true, report });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
