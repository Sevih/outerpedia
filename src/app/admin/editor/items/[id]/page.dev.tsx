import Link from 'next/link';
import type { Route } from 'next';
import { ItemCuratedEditor, type ItemBase } from '@/components/admin/ItemCuratedEditor';
import { getItems } from '@/lib/data/items';
import { getGoods } from '@/lib/data/goods';
import { loadItemCurated } from '@/lib/admin/item-curated-store';

export const dynamic = 'force-dynamic';

const EMPTY = { en: '', jp: '', kr: '', zh: '' };

export default async function EditorItemDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const it = getItems()[id];
  const g = getGoods()[id];
  const initial = loadItemCurated()[id] ?? {};

  // Id inconnu de items/goods = CRÉATION (monnaie hors SYS_ASSET_*, item custom…).
  const base: ItemBase = it
    ? { kind: 'item', name: it.name, desc: it.desc, icon: it.icon, grade: it.grade }
    : g
      ? { kind: 'goods', name: g.name, desc: g.desc, icon: g.icon, grade: g.grade }
      : { kind: 'custom', name: EMPTY, icon: id.startsWith('TI_') ? id : '', grade: 'normal' };
  const isNew = !it && !g;

  return (
    <div className="space-y-4">
      <Link
        href={'/admin/editor/items' as Route}
        className="text-content-subtle hover:text-content text-sm"
      >
        ← Items
      </Link>
      <h1 className="text-content-strong text-xl font-semibold">
        {base.name.en || id} <span className="text-content-subtle text-sm">({base.kind})</span>
      </h1>
      {isNew && (
        <p className="border-accent/40 bg-accent/5 text-accent rounded-lg border p-3 text-sm">
          Création : id absent de items/goods. Renseigne au moins un nom EN (par clé texte ou à la
          main) puis enregistre.
        </p>
      )}
      <ItemCuratedEditor id={id} base={base} initial={initial} creation={isNew} />
    </div>
  );
}
