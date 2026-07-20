'use client';

import { useEffect, useRef, useState } from 'react';
import type { EffectGroup } from '@/lib/data/effect-filters';

type Side = 'buff' | 'debuff';

/**
 * Grille des effets d'un côté (buff/desktop = grille d'icônes par famille ;
 * mobile = listes déroulantes à cases). Portage V2 réhabillé sur tokens V3 :
 * cyan = buff, rose = debuff. Les sprites d'effet sont déjà encadrés (`_D`,
 * `_Interruption`) → rendus tels quels, anneau de sélection par-dessus.
 */
export function EffectGroupGrid({
  groups,
  selected,
  side,
  onToggle,
}: {
  groups: EffectGroup[];
  selected: string[];
  side: Side;
  onToggle: (key: string) => void;
}) {
  const sel = new Set(selected);
  return (
    <>
      {/* Desktop (≥ md, = sidebar xl) : cartes de famille + grille d'icônes */}
      <div className="hidden grid-cols-1 gap-3 sm:grid-cols-2 md:grid">
        {groups.map((group) => (
          <div
            key={group.category}
            className="border-line-subtle bg-surface-sunken/40 rounded-xl border p-2"
          >
            <p
              className={`mb-2 text-center text-xs font-semibold ${side === 'buff' ? 'text-sky-300' : 'text-rose-300'}`}
            >
              {group.title}
            </p>
            <div className="grid grid-cols-6 justify-items-center gap-1 xl:grid-cols-5">
              {group.effects.map((eff) => (
                <EffectIconToggle
                  key={eff.key}
                  label={eff.label}
                  icon={eff.icon}
                  side={side}
                  selected={sel.has(eff.key)}
                  onClick={() => onToggle(eff.key)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile (< md, = drawer) : déroulants à cases */}
      <div className="space-y-1.5 md:hidden">
        {groups.map((group) => (
          <CheckboxSelect
            key={group.category}
            group={group}
            selected={sel}
            side={side}
            onToggle={onToggle}
          />
        ))}
      </div>
    </>
  );
}

// ── Bouton-icône (desktop) ──────────────────────────────────────────────────

function EffectIconToggle({
  label,
  icon,
  side,
  selected,
  onClick,
}: {
  label: string;
  icon: string;
  side: Side;
  selected: boolean;
  onClick: () => void;
}) {
  const ring = selected ? (side === 'buff' ? 'ring-2 ring-sky-400' : 'ring-2 ring-rose-400') : '';
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={selected}
      className={`bg-scrim relative size-6 shrink-0 cursor-pointer rounded transition hover:scale-110 hover:brightness-150 ${ring}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
      <img src={icon} alt="" className="size-full rounded object-contain" />
    </button>
  );
}

// ── Déroulant à cases (mobile) ──────────────────────────────────────────────

function CheckboxSelect({
  group,
  selected,
  side,
  onToggle,
}: {
  group: EffectGroup;
  selected: Set<string>;
  side: Side;
  onToggle: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = group.effects.filter((e) => selected.has(e.key)).length;
  const color = side === 'buff' ? 'text-sky-300' : 'text-rose-300';
  const badge = side === 'buff' ? 'bg-sky-500/25 text-sky-300' : 'bg-rose-500/25 text-rose-300';

  // Fermeture au clic extérieur (le handler pose le state — pas dans le corps de l'effet).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`border-line-subtle bg-surface-sunken/70 flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm ${open ? 'border-line' : ''}`}
      >
        <span className={`font-semibold ${color}`}>{group.title}</span>
        <span className="flex items-center gap-1.5">
          {count > 0 && (
            <span className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold ${badge}`}>
              {count}
            </span>
          )}
          <svg
            className={`text-content-subtle size-4 transition-transform ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>
      {open && (
        <div className="border-line bg-surface-overlay absolute z-40 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border shadow-xl">
          {group.effects.map((eff) => {
            const checked = selected.has(eff.key);
            return (
              <label
                key={eff.key}
                className={`flex cursor-pointer items-center gap-2 px-3 py-1.5 transition select-none ${checked ? 'bg-surface-raised/70' : 'hover:bg-surface-raised/40'}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(eff.key)}
                  className={`size-4 shrink-0 ${side === 'buff' ? 'accent-sky-500' : 'accent-rose-500'}`}
                />
                <span className="bg-scrim relative size-5 shrink-0 rounded">
                  {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
                  <img src={eff.icon} alt="" className="size-full rounded object-contain" />
                </span>
                <span className="text-content text-xs">{eff.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
