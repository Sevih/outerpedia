import type { Goods } from '@contracts';
import goodsData from '@data/generated/goods.json';
import type { ItemOption } from '@/lib/data/items';

const GOODS = goodsData as unknown as Record<string, Goods>;

export function getGoods(): Record<string, Goods> {
  return GOODS;
}

export function getGood(id: string): Goods | undefined {
  return GOODS[id];
}

/** Forme compacte (id + nom EN + icône + grade) pour picker / catalogue. */
export function goodsOptions(): ItemOption[] {
  return Object.entries(GOODS)
    .filter(([, g]) => g.name.en)
    .map(([id, g]) => ({ id, name: g.name.en, icon: g.icon, grade: g.grade }));
}

/** Index nom EN (minuscule) → id de goods, pour mapper les rewards V2 par nom. */
export function goodsIdByName(): Map<string, string> {
  const m = new Map<string, string>();
  for (const [id, g] of Object.entries(GOODS)) {
    const n = g.name.en.trim().toLowerCase();
    if (n && !m.has(n)) m.set(n, id);
  }
  return m;
}
