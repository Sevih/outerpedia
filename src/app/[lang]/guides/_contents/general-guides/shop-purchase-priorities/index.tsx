/**
 * Guide « Shop Purchase Priorities » — un onglet par shop.
 *
 * Les 8 shops permanents « à monnaie » (guild, joint, friend, arena, stars,
 * worldboss, adventure-license, survey) DÉRIVENT du jeu
 * (data/generated/shop-priorities.json) : noms/coûts/limites toujours à jour
 * (la V2 codait ~1000 lignes en dur, déjà périmées). Seule la priorité S/A/B/C
 * et les notes sont éditoriales (overlay curé, fusionné au build). Les shops
 * variables (Event, General/Resource) ou en texte (Supply, Rico) restent
 * éditoriaux — cf. editorial.ts.
 *
 * Server Component ; parse-text STRICT sur les tags {I-I/…} des textes.
 */
import type { ReactNode } from 'react';
import type { Lang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { lRec } from '@/lib/i18n/localize';
import { parseText, type ParseCtx } from '@/lib/parse-text';
import { img } from '@/lib/images';
import { InlineIcon } from '@/components/inline/InlineIcon';
import { SegmentedTabs, type TabItem } from '@/components/guides/SegmentedTabs';
import { Prose, Callout } from '@/components/guides/editorial/blocks';
import type { LocalizedText, ShopPrioritiesData, ShopEntry, ShopPeriod } from '@contracts';
import shopDataRaw from '@data/generated/shop-priorities.json';
import { LABELS, SHOP_TABS } from './labels';
import {
  SHOP_NOTES,
  TEXT_SHOPS,
  EVENT_ITEMS,
  RESOURCE_ITEMS,
  type EditorialItem,
} from './editorial';

const shopData = shopDataRaw as ShopPrioritiesData;
const WHERE = 'shop-purchase-priorities';

type Priority = 'S' | 'A' | 'B' | 'C';
const PRIORITY_RANK: Record<Priority, number> = { S: 0, A: 1, B: 2, C: 3 };
const PRIORITY_BADGE: Record<Priority, string> = {
  S: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/40',
  A: 'bg-sky-500/15 text-sky-300 ring-sky-500/40',
  B: 'bg-amber-500/15 text-amber-300 ring-amber-500/40',
  C: 'bg-surface-sunken text-content-subtle ring-line-subtle',
};
const PERIOD_ABBR: Record<ShopPeriod, string> = {
  daily: 'D',
  weekly: 'W',
  monthly: 'M',
  'one-time': 'O',
};

/** Une ligne de table, forme commune au dérivé et à l'éditorial. */
interface Row {
  priority?: Priority;
  item: ReactNode;
  cost: ReactNode;
  limit: ReactNode;
  notes: ReactNode;
}

export default async function ShopPurchasePrioritiesGuide({ lang }: { lang: Lang }) {
  const t = await getT(lang);
  const ctx: ParseCtx = { lang, t, strict: true };
  const L = (m: LocalizedText): string => lRec(m, lang) || m.en || '';
  const fmt = (n: number): string => n.toLocaleString('en-US');

  const derivedByKey = new Map(shopData.shops.map((s) => [s.key, s]));

  function PriorityBadge({ p }: { p?: Priority }) {
    if (!p) return <span className="text-content-subtle text-xs">—</span>;
    return (
      <span
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ring-1 ${PRIORITY_BADGE[p]}`}
      >
        {p}
      </span>
    );
  }

  /** « ×N » quand le gain est multiple ET pas déjà écrit dans le nom du produit. */
  const givesSuffix = (name: string, gives: number): string =>
    gives > 1 && !name.includes(fmt(gives)) && !name.includes(String(gives))
      ? ` ×${fmt(gives)}`
      : '';

  const limitNode = (count: number, period: ShopPeriod): ReactNode =>
    count > 0 ? (
      <span className="whitespace-nowrap">
        {count} / {PERIOD_ABBR[period]}
      </span>
    ) : (
      <span className="text-content-subtle">—</span>
    );

  /** Ligne d'un produit DÉRIVÉ (nom + icône du jeu, coût dans la monnaie du shop). */
  const derivedRow = (e: ShopEntry, currencyIcon: string): Row => ({
    priority: e.priority,
    item: (
      <span className="inline-flex items-center gap-1">
        {e.icon ? (
          <InlineIcon icon={img.item(e.icon)} label={L(e.name)} size={22} underline={false} />
        ) : (
          <span>{L(e.name)}</span>
        )}
        <span className="text-content-subtle">{givesSuffix(L(e.name), e.gives)}</span>
      </span>
    ),
    cost: (
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        {fmt(e.cost)}
        {currencyIcon && (
          // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
          <img
            src={img.item(currencyIcon)}
            alt=""
            width={16}
            height={16}
            className="inline-block"
          />
        )}
      </span>
    ),
    limit: limitNode(e.limit.count, e.limit.period),
    notes: e.notes ? (
      <span className="text-content-muted text-xs">{parseText(L(e.notes), ctx)}</span>
    ) : null,
  });

  /** Ligne d'un item ÉDITORIAL (event/resource) : nom en texte, monnaie par ligne. */
  const editorialRow = (it: EditorialItem): Row => {
    const label = it.label ? L(it.label) : it.name;
    return {
      priority: it.priority,
      item: (
        <span>
          {label}
          {it.gives ? (
            <span className="text-content-subtle">{givesSuffix(label, it.gives)}</span>
          ) : null}
        </span>
      ),
      cost: it.cost ? (
        it.cost.currency.toLowerCase() === 'tbd' ? (
          <span className="text-content-subtle italic">TBD</span>
        ) : (
          <span className="whitespace-nowrap">
            {fmt(it.cost.amount)} {it.cost.currency}
          </span>
        )
      ) : (
        <span className="text-content-subtle">—</span>
      ),
      limit: it.limit ? (
        limitNode(it.limit.count, it.limit.period)
      ) : (
        <span className="text-content-subtle">—</span>
      ),
      notes: it.notes ? (
        <span className="text-content-muted text-xs">{parseText(L(it.notes), ctx)}</span>
      ) : null,
    };
  };

  const sortRows = (rows: Row[]): Row[] =>
    [...rows].sort(
      (a, b) =>
        (a.priority ? PRIORITY_RANK[a.priority] : 9) - (b.priority ? PRIORITY_RANK[b.priority] : 9),
    );

  const ShopTable = ({ rows }: { rows: Row[] }) => {
    const hasNotes = rows.some((r) => r.notes);
    return (
      <div className="border-line overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-surface-sunken text-content-subtle text-xs">
            <tr>
              <th className="px-3 py-2 text-left font-medium">{L(LABELS.colPriority)}</th>
              <th className="px-3 py-2 text-left font-medium">{L(LABELS.colItem)}</th>
              <th className="px-3 py-2 text-left font-medium">{L(LABELS.colCost)}</th>
              <th className="px-3 py-2 text-left font-medium">{L(LABELS.colLimit)}</th>
              {hasNotes && (
                <th className="px-3 py-2 text-left font-medium">{L(LABELS.colNotes)}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-line-subtle border-t">
                <td className="px-3 py-2">
                  <PriorityBadge p={r.priority} />
                </td>
                <td className="text-content px-3 py-2">{r.item}</td>
                <td className="text-content px-3 py-2">{r.cost}</td>
                <td className="text-content px-3 py-2 text-center">{r.limit}</td>
                {hasNotes && <td className="px-3 py-2">{r.notes}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const Legend = () => (
    <p className="text-content-subtle mt-3 text-xs">
      <span className="font-semibold">{L(LABELS.legendTitle)}</span> {L(LABELS.legendS)} ·{' '}
      {L(LABELS.legendA)} · {L(LABELS.legendB)} · {L(LABELS.legendC)}
      <br />
      <span className="font-semibold">{L(LABELS.periodsTitle)}</span> {L(LABELS.periodD)} ·{' '}
      {L(LABELS.periodW)} · {L(LABELS.periodM)} · {L(LABELS.periodO)}
    </p>
  );

  const noteFor = (key: string): ReactNode =>
    SHOP_NOTES[key] ? (
      <p className="text-content-muted mx-auto max-w-3xl text-center text-sm">
        {L(SHOP_NOTES[key])}
      </p>
    ) : null;

  /** Panneau d'un shop DÉRIVÉ. */
  const derivedPanel = (key: string): ReactNode => {
    const shop = derivedByKey.get(key);
    if (!shop) return null;
    const rows = sortRows(shop.entries.map((e) => derivedRow(e, shop.currency.icon)));
    return (
      <div className="space-y-3">
        <div className="text-content-subtle flex items-center justify-center gap-1.5 text-sm">
          <span>{L(LABELS.colCost)}:</span>
          {shop.currency.icon && (
            // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
            <img
              src={img.item(shop.currency.icon)}
              alt=""
              width={18}
              height={18}
              className="inline-block"
            />
          )}
          <span className="text-content font-medium">{L(shop.currency.name)}</span>
        </div>
        {noteFor(key)}
        <ShopTable rows={rows} />
        <Legend />
      </div>
    );
  };

  /** Panneau d'un shop en TEXTE (supply, rico). */
  const textPanel = (key: string): ReactNode => {
    const shop = TEXT_SHOPS[key];
    if (!shop) return null;
    return (
      <div className="mx-auto max-w-3xl space-y-3 text-sm">
        {shop.paragraphs.map((p, i) => (
          <Prose key={i}>{parseText(L(p), ctx)}</Prose>
        ))}
        {shop.gearNote && (
          <Callout accent="sky">
            {L(shop.gearNote)} {L(LABELS.seeGearUsageFinder)}
          </Callout>
        )}
      </div>
    );
  };

  /** Panneau d'un shop ÉDITORIAL en table (event, resource). */
  const editorialPanel = (key: string, items: EditorialItem[]): ReactNode => (
    <div className="space-y-3">
      {noteFor(key)}
      <ShopTable rows={sortRows(items.map(editorialRow))} />
      <Legend />
    </div>
  );

  const panelFor = (key: string): ReactNode => {
    if (derivedByKey.has(key)) return derivedPanel(key);
    if (key === 'supply' || key === 'rico') return textPanel(key);
    if (key === 'event') return editorialPanel(key, EVENT_ITEMS);
    if (key === 'resource') return editorialPanel(key, RESOURCE_ITEMS);
    throw new Error(`${WHERE} : shop « ${key} » sans panneau`);
  };

  const tabs: TabItem[] = SHOP_TABS.map(({ key, label }) => {
    const shop = derivedByKey.get(key);
    return {
      key,
      label: (
        <span className="inline-flex items-center gap-1.5">
          {shop?.currency.icon && (
            // eslint-disable-next-line @next/next/no-img-element -- asset R2/staging
            <img
              src={img.item(shop.currency.icon)}
              alt=""
              width={16}
              height={16}
              className="inline-block"
            />
          )}
          <span>{L(label)}</span>
        </span>
      ),
      content: panelFor(key),
    };
  });

  return (
    <>
      <Prose>{L(LABELS.description)}</Prose>
      <SegmentedTabs tabs={tabs} ariaLabel={L(LABELS.colItem)} urlKey="shop" variant="pill" />
    </>
  );
}
