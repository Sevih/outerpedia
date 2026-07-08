import { ItemsBrowser, type CatalogEntry } from '@/components/admin/ItemsBrowser';
import { listItemEntries } from '@/lib/data/item-catalog';
import { unusedItemIcons } from '@/lib/admin/item-icons';

export const dynamic = 'force-dynamic';

/** Editor · Item : catalogue items + monnaies (mergé + curé) + sprites à rentrer. */
export default function EditorItems() {
  const merged = listItemEntries();
  const entries: CatalogEntry[] = merged.map((e) => ({
    id: e.id,
    name: e.name.en || e.id,
    desc: e.desc?.en,
    icon: e.icon,
    grade: e.grade,
    type: e.type,
    star: e.star,
    hidden: e.hidden,
    curated: e.curated,
  }));

  // Sprites TI_* extraits mais pas encore rattachés à un item : à rentrer.
  const unused: CatalogEntry[] = unusedItemIcons().map((s) => ({
    id: s,
    name: s,
    icon: s,
    grade: 'normal',
    type: 'unused',
  }));

  const goods = entries.filter((e) => e.type === 'goods').length;
  const noDesc = entries.filter((e) => !e.desc).length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-content-strong text-xl font-semibold">Editor · Item</h1>
        <p className="text-content-muted text-sm">
          {entries.length - goods} items + {goods} monnaies · {noDesc} sans description ·{' '}
          {unused.length} sprites à rentrer (filtre <span className="font-mono">unused</span>).
          Clique une ligne pour éditer / rentrer.
        </p>
      </div>
      <ItemsBrowser entries={[...entries, ...unused]} />
    </div>
  );
}
