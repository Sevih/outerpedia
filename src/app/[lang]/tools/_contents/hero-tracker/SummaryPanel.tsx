'use client';

/**
 * Colonne RÉCAP : total du compte, liste de courses filtrée par axe, pièces
 * groupées comme on les farme. Extrait du composant principal (découpage du
 * 03/10/2026 — JSX déplacé tel quel ; le total et la liste se calculent au
 * parent, via useTrackerState et useRosterView).
 */
import { useMemo } from 'react';
import { EquipmentIcon } from '@/components/equipment/EquipmentIcon';
import { img, ELEMENT_ORDER } from '@/lib/images';
import { piecesApart, type HeroRow, type HeroTrackerLabels, type ItemAsset } from './contracts';
import { NEED_AXES, type accountNeed, type NeedAxis } from './engine';
import { fmt, PieceIcon, short } from './ui';

/* ─────────────────────────── Récapitulatif ─────────────────────────── */

interface ShoppingRow {
  id: string;
  count: number;
  asset?: ItemAsset;
}

export function SummaryPanel({
  total,
  shopping,
  itemTotal,
  heroById,
  elementNames,
  limitedTags,
  axis,
  onAxis,
  labels,
}: {
  total: ReturnType<typeof accountNeed>;
  shopping: ShoppingRow[];
  itemTotal: number;
  heroById: Map<string, HeroRow>;
  elementNames: Record<string, string>;
  limitedTags: string[];
  axis: NeedAxis | 'all';
  onAxis: (a: NeedAxis | 'all') => void;
  labels: HeroTrackerLabels;
}) {
  const axisLabel: Record<NeedAxis, string> = {
    level: labels.level,
    skills: labels.skills,
    ee: labels.ee,
  };
  /**
   * Les pièces se farment par ÉLÉMENT : on les groupe comme on les récolte, du
   * plus gros besoin au plus petit. Premium et limités n'ont pas cette porte de
   * sortie et font leurs propres groupes — sinon la colonne « feu » promettrait
   * un donjon qui ne les donnera jamais.
   */
  const pieceGroups = useMemo(() => {
    const apart = piecesApart(limitedTags);
    const rows = Object.entries(total.pieces).map(([id, { pieces: count, steps }]) => ({
      id,
      count,
      steps,
      hero: heroById.get(id),
    }));
    const family = (r: (typeof rows)[number]) =>
      apart.find((f) => r.hero?.tags?.some((t) => f.tags.includes(t)))?.key;
    const order = (a: { count: number }, b: { count: number }) => b.count - a.count;
    const groups: {
      key: string;
      /** `null` = un groupe à part : aucun donjon d'élément derrière lui. */
      element: string | null;
      label: string;
      rows: typeof rows;
    }[] = ELEMENT_ORDER.map((el) => ({
      key: el,
      element: el,
      label: elementNames[el] ?? el,
      rows: rows.filter((r) => !family(r) && r.hero?.element === el).sort(order),
    }));
    const apartLabel: Record<string, string> = {
      premium: labels.piecesPremium,
      limited: labels.piecesLimited,
    };
    for (const f of apart) {
      groups.push({
        key: f.key,
        element: null,
        label: apartLabel[f.key],
        rows: rows.filter((r) => family(r) === f.key).sort(order),
      });
    }
    return groups.filter((g) => g.rows.length > 0);
  }, [
    total.pieces,
    heroById,
    elementNames,
    limitedTags,
    labels.piecesPremium,
    labels.piecesLimited,
  ]);

  return (
    <details
      open
      className="border-line bg-surface-raised overflow-hidden rounded-xl border shadow-lg"
    >
      <summary className="bg-surface-overlay border-line-subtle flex cursor-pointer list-none items-center gap-3 border-b px-3 py-2 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">
          <span className="text-content-muted text-3xs block font-mono tracking-wide uppercase">
            {labels.needTitle} ·{' '}
            {labels.trackedCount.replace('{count}', String(total.heroes.length))}
          </span>
          <span className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-content-strong font-mono text-lg font-bold">
              {fmt(itemTotal)}
            </span>
            <span className="text-content-muted text-xs">{labels.itemUnit}</span>
            {total.gold > 0 && (
              <>
                <span className="bg-line-subtle h-3 w-px" />
                <span className="text-warn font-mono text-sm font-semibold">
                  {short(total.gold)}
                </span>
              </>
            )}
          </span>
        </span>
        <span className="flex gap-1">
          {shopping.slice(0, 3).map((r) => (
            <EquipmentIcon
              key={r.id}
              src={img.item(r.asset?.icon ?? '')}
              grade={r.asset?.grade ?? 'normal'}
              alt={r.asset?.name ?? ''}
              size={26}
            />
          ))}
        </span>
      </summary>

      <div className="space-y-3 p-3">
        <div className="grid grid-cols-3 gap-2">
          <Tile label={labels.gold} value={short(total.gold)} accent />
          <Tile label={labels.xp} value={short(total.xp)} />
          <Tile label={labels.affinityPoints} value={short(total.affinityPoints)} />
        </div>

        <div className="flex items-center justify-between gap-2">
          <h3 className="text-content-strong text-sm font-semibold">{labels.shoppingList}</h3>
          <div className="border-line-subtle bg-surface-sunken flex gap-0.5 rounded-lg border p-0.5">
            {(['all', ...NEED_AXES] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => onAxis(a)}
                className={`text-3xs rounded-md px-2 py-0.5 transition-colors ${
                  axis === a
                    ? 'bg-surface-overlay text-content-strong font-semibold'
                    : 'text-content-muted hover:text-content-strong'
                }`}
              >
                {a === 'all' ? labels.axisAll : axisLabel[a]}
              </button>
            ))}
          </div>
        </div>

        {shopping.length === 0 ? (
          <p className="text-content-subtle text-sm">{labels.needEmpty}</p>
        ) : (
          <ul className="border-line-subtle divide-line-subtle divide-y overflow-hidden rounded-lg border">
            {shopping.map((r) => (
              <li key={r.id} className="bg-surface-raised flex items-center gap-2.5 px-2.5 py-1.5">
                <EquipmentIcon
                  src={img.item(r.asset?.icon ?? '')}
                  grade={r.asset?.grade ?? 'normal'}
                  alt=""
                  size={32}
                />
                <span className="text-content min-w-0 flex-1 text-[13px] leading-tight wrap-break-word">
                  {r.asset?.name}
                </span>
                <span className="text-content-strong font-mono text-sm font-semibold">
                  ×{fmt(r.count)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {total.affinityPoints > 0 && (
          <p className="text-content-subtle text-3xs">{labels.giftNoteBonus}</p>
        )}

        {pieceGroups.length > 0 && (
          <div className="border-line-subtle bg-surface-sunken rounded-lg border border-dashed p-2.5">
            <h3 className="text-content-muted text-3xs font-mono tracking-wide uppercase">
              {labels.piecesNote}
            </h3>
            <div className="mt-2 space-y-2.5">
              {pieceGroups.map((g) => (
                <div key={g.key}>
                  <h4 className="text-content-subtle text-2xs flex items-center gap-1 font-mono tracking-wide uppercase">
                    {g.element && (
                      <img
                        src={img.element(g.element)}
                        alt=""
                        aria-hidden
                        width={14}
                        height={14}
                        className="h-3.5 w-3.5"
                      />
                    )}
                    {g.label}
                  </h4>
                  {/* L'icône porte le héros, le nombre porte le besoin : le nom
                      n'apporterait qu'une colonne de texte tronqué. */}
                  <ul className="mt-1 grid grid-cols-3 gap-1.5">
                    {g.rows.map((r) => (
                      <li
                        key={r.id}
                        title={`${r.hero?.name ?? r.id} — ×${fmt(r.count)} ${labels.dupes.replace(
                          '{count}',
                          String(r.steps),
                        )}`}
                        className="border-line-subtle bg-surface-raised flex flex-col items-center gap-0.5 rounded-lg border px-1 py-1.5"
                      >
                        <PieceIcon id={r.id} large />
                        <span className="text-content-strong text-3xs font-mono font-semibold">
                          ×{fmt(r.count)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </details>
  );
}

function Tile({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="border-line-subtle bg-surface-sunken rounded-lg border px-2 py-1.5">
      <div className="text-content-muted text-2xs truncate font-mono tracking-wide uppercase">
        {label}
      </div>
      <div
        className={`mt-0.5 font-mono text-sm font-bold ${accent ? 'text-warn' : 'text-content-strong'}`}
      >
        {value}
      </div>
    </div>
  );
}
