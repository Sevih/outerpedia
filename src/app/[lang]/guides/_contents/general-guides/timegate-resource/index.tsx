/**
 * Guide « Weekly & Monthly Reference Tables » — un onglet par famille de
 * ressource, une table par item.
 *
 * Tout le factuel DÉRIVE de `data/generated/timegate-resources.json` : les
 * lignes de SHOP viennent de `ProductTemplet` (quantité auto-corrigée quand un
 * shop est rebrassé — la dérivation trouve même Tower/Remains/Real-Time Arena
 * que la hand-list V2 avait ratés) ; les lignes NON-SHOP (drops, missions,
 * singularité, atelier de Kate) sont un overlay curé car leur quantité est une
 * estimation joueur absente de la donnée. Ici : présentation seule.
 *
 * Server Component ; les items sont rendus en tuile à cadre de rareté (ItemInline).
 */
import type { ReactNode } from 'react';
import type { Lang } from '@/lib/i18n/config';
import { lRec } from '@/lib/i18n/localize';
import { img } from '@/lib/images';
import { ItemInline } from '@/components/inline/ItemInline';
import { SegmentedTabs, type TabItem } from '@/components/guides/SegmentedTabs';
import { Prose } from '@/components/guides/editorial/blocks';
import type {
  LocalizedText,
  TimegateResourcesData,
  TimegateItem,
  TimegateSource,
  SourceType,
} from '@contracts';
import timegateRaw from '@data/generated/timegate-resources.json';
import { LABELS } from './labels';

const data = timegateRaw as TimegateResourcesData;

/** Badge par type de source — accents emerald/sky/amber (autorisés) + neutre. */
const BADGE: Record<SourceType, string> = {
  mission: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/40',
  guild: 'bg-amber-500/15 text-amber-300 ring-amber-500/40',
  shop: 'bg-sky-500/15 text-sky-300 ring-sky-500/40',
  craft: 'bg-surface-sunken text-content-subtle ring-line-subtle',
};

export default function TimegateResourceGuide({ lang }: { lang: Lang }) {
  const L = (m: LocalizedText): string => lRec(m, lang) || m.en || '';
  const fmt = (n: number): string => n.toLocaleString('en-US');

  const sourceLabel = (key: string): string => {
    const m = (LABELS.sources as Record<string, LocalizedText>)[key];
    return m ? L(m) : key;
  };

  /** Cellule quantité : nombre fixe, plage estimée (20–240), ou vide. */
  const qty = (n?: number, range?: [number, number]): ReactNode => {
    if (range)
      return <span className="whitespace-nowrap">{`${fmt(range[0])}–${fmt(range[1])}`}</span>;
    if (n != null) return fmt(n);
    return <span className="text-content-subtle">–</span>;
  };

  /** Libellé d'une source + badge de type + éventuel coût de craft (chip item). */
  const SourceCell = ({ s }: { s: TimegateSource }) => (
    <div className="flex flex-wrap items-center gap-1.5">
      <span
        className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ring-1 ${BADGE[s.type]}`}
      >
        {L(LABELS.badges[s.type])}
      </span>
      <span>{sourceLabel(s.sourceKey)}</span>
      {s.costItem && s.costAmount != null && (
        <span className="text-content-subtle inline-flex items-center gap-1 text-xs">
          ({L(LABELS.costLabel)} {fmt(s.costAmount)}×
          <ItemInline
            item={{
              name: L(s.costItem.name),
              iconSrc: img.item(s.costItem.icon),
              grade: s.costItem.grade,
            }}
            size={18}
            color="text-content-subtle"
          />
          )
        </span>
      )}
    </div>
  );

  const ResourceTable = ({ item }: { item: TimegateItem }) => (
    <div className="mx-auto w-full max-w-2xl space-y-2">
      <h3 className="flex items-center justify-center">
        <ItemInline
          item={{ name: L(item.name), iconSrc: img.item(item.icon), grade: item.grade }}
          size={26}
          color="text-content font-semibold"
        />
      </h3>
      <div className="border-line overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-surface-sunken text-content-subtle text-xs">
            <tr>
              <th className="px-3 py-2 text-left font-medium">{L(LABELS.headers.source)}</th>
              <th className="px-3 py-2 text-center font-medium">{L(LABELS.headers.weekly)}</th>
              <th className="px-3 py-2 text-center font-medium">{L(LABELS.headers.monthly)}</th>
            </tr>
          </thead>
          <tbody>
            {item.sources.map((s, i) => {
              const newGroup = i > 0 && item.sources[i - 1].type !== s.type;
              return (
                <tr
                  key={i}
                  className={newGroup ? 'border-line border-t' : 'border-line-subtle border-t'}
                >
                  <td className="text-content px-3 py-2">
                    <SourceCell s={s} />
                  </td>
                  <td className="text-content px-3 py-2 text-center">
                    {qty(s.weekly, s.weeklyRange)}
                  </td>
                  <td className="text-content px-3 py-2 text-center">{qty(s.monthly)}</td>
                </tr>
              );
            })}
            <tr className="bg-surface-sunken text-content border-line border-t-2 font-semibold">
              <td className="px-3 py-2 text-left">{L(LABELS.headers.total)}</td>
              <td className="px-3 py-2 text-center">{qty(item.totals.weekly || undefined)}</td>
              <td className="px-3 py-2 text-center">{qty(item.totals.monthly || undefined)}</td>
            </tr>
            <tr className="bg-surface-sunken text-content border-line-subtle border-t font-bold">
              <td className="px-3 py-2 text-left" colSpan={2}>
                {L(LABELS.headers.grandTotal)}
              </td>
              <td className="px-3 py-2 text-center">{fmt(item.totals.grandMonthly)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const tabs: TabItem[] = data.tabs.map((tab) => ({
    key: tab.key,
    label: (
      <span className="inline-flex items-center gap-1.5">
        {tab.items[0] && (
          <img
            src={img.item(tab.items[0].icon)}
            alt=""
            width={18}
            height={18}
            className="inline-block"
          />
        )}
        <span>{L((LABELS.tabs as Record<string, LocalizedText>)[tab.key])}</span>
      </span>
    ),
    content: (
      <div className="space-y-8">
        {tab.items.map((item) => (
          <ResourceTable key={item.id} item={item} />
        ))}
      </div>
    ),
  }));

  return (
    <>
      <Prose>{L(LABELS.intro)}</Prose>
      <SegmentedTabs tabs={tabs} ariaLabel={L(LABELS.headers.source)} urlKey="tab" variant="game" />
    </>
  );
}
