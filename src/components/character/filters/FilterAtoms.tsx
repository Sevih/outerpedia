'use client';

import { img } from '@/lib/images';

/**
 * Vocabulaire visuel des filtres de `/characters` (portage V2 réhabillé sur les
 * tokens/sprites V3). Les couleurs vives sont des COULEURS DE DONNÉE (par
 * élément/role/rareté) posées en style inline pour composer des halos
 * `${hex}22` — mêmes teintes que les tokens `--fire`… ; l'opacité en suffixe hex
 * interdit une `var()`, d'où la table locale (même choix que `nodeStyles` V2).
 */

/** Teinte par élément (slug V3) — égale aux tokens `--fire`… */
export const ELEMENT_HEX: Record<string, string> = {
  fire: '#ff6b6b',
  water: '#4dabf7',
  earth: '#51cf66',
  light: '#ffe066',
  dark: '#cc5de8',
};

/** Teinte par role curé. */
export const ROLE_HEX: Record<string, string> = {
  dps: '#e11d48',
  support: '#0284c7',
  sustain: '#059669',
};

/** Teinte par rareté (étoiles). */
export const RARITY_HEX: Record<number, string> = {
  1: '#e5e7eb',
  2: '#93c5fd',
  3: '#f87171',
};

/** Teintes fonctionnelles partagées (chips, toggles, onglets). */
export const TONE = {
  cyan: '#22d3ee',
  amber: '#fbbf24',
  emerald: '#4ade80',
  rose: '#f87171',
  indigo: '#6366f1',
} as const;

/** Bordure neutre d'une pill au repos (token `--line-subtle`). */
const IDLE_BORDER = '#42566e';

// ── IconPill — pastille carrée colorée (élément, classe) ────────────────────

interface IconPillProps {
  active: boolean;
  color: string;
  onClick: () => void;
  size?: 'sm' | 'md';
  title?: string;
  children: React.ReactNode;
  'aria-label'?: string;
}

export function IconPill({
  active,
  color,
  onClick,
  size = 'md',
  title,
  children,
  ...rest
}: IconPillProps) {
  const dim = size === 'sm' ? 32 : 36;
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      aria-label={rest['aria-label']}
      style={{
        width: dim,
        height: dim,
        borderColor: active ? `${color}99` : IDLE_BORDER,
        background: active ? `${color}22` : undefined,
        boxShadow: active ? `inset 0 0 0 1px ${color}44, 0 0 14px ${color}26` : undefined,
      }}
      className={`focus-visible:ring-accent flex shrink-0 items-center justify-center rounded-lg border transition focus:outline-none focus-visible:ring-2 ${active ? '' : 'bg-surface-sunken/70'}`}
    >
      {children}
    </button>
  );
}

/** Sprite carré (élément/classe) posé dans une IconPill. */
function PillSprite({ src, size }: { src: string; size: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 18 : 20;
  return (
    <span className="relative block" style={{ width: dim, height: dim }}>
      <img src={src} alt="" className="size-full object-contain" />
    </span>
  );
}

export function ElementIconPill({
  element,
  active,
  onClick,
  size = 'md',
  title,
}: {
  element: string;
  active: boolean;
  onClick: () => void;
  size?: 'sm' | 'md';
  /** Tooltip/aria localisé (défaut : le slug). */
  title?: string;
}) {
  return (
    <IconPill
      active={active}
      color={ELEMENT_HEX[element] ?? TONE.cyan}
      onClick={onClick}
      size={size}
      title={title ?? element}
      aria-label={title ?? element}
    >
      <PillSprite src={img.element(element)} size={size} />
    </IconPill>
  );
}

export function ClassIconPill({
  classType,
  active,
  onClick,
  size = 'md',
  title,
}: {
  classType: string;
  active: boolean;
  onClick: () => void;
  size?: 'sm' | 'md';
  /** Tooltip/aria localisé (défaut : le slug). */
  title?: string;
}) {
  return (
    <IconPill
      active={active}
      color={TONE.cyan}
      onClick={onClick}
      size={size}
      title={title ?? classType}
      aria-label={title ?? classType}
    >
      <PillSprite src={img.klass(classType)} size={size} />
    </IconPill>
  );
}

// ── StarPill — bascule de rareté ────────────────────────────────────────────

export function StarPill({
  stars,
  active,
  onClick,
  ariaLabel,
}: {
  stars: number;
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  const color = RARITY_HEX[stars] ?? TONE.cyan;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      style={{
        borderColor: active ? `${color}99` : IDLE_BORDER,
        background: active ? `${color}1f` : undefined,
      }}
      className={`focus-visible:ring-accent inline-flex h-8 shrink-0 items-center gap-0.5 rounded-lg border px-2.5 transition focus:outline-none focus-visible:ring-2 ${active ? '' : 'bg-surface-sunken/70'}`}
    >
      {Array.from({ length: stars }, (_, i) => (
        <img
          key={i}
          src={img.star()}
          alt=""
          width={14}
          height={14}
          style={{ width: 14, height: 14 }}
        />
      ))}
    </button>
  );
}

// ── ActiveChip — pastille avec × ────────────────────────────────────────────

export function ActiveChip({
  label,
  color = TONE.cyan,
  prefix,
  onRemove,
}: {
  label: React.ReactNode;
  color?: string;
  prefix?: string;
  onRemove: () => void;
}) {
  return (
    <span
      style={{ borderColor: `${color}55`, background: `${color}14`, color }}
      className="inline-flex h-6.5 shrink-0 items-center gap-1.5 rounded-full border pr-1 pl-2.5 text-xs"
    >
      {prefix && (
        <span
          style={{ color, opacity: 0.7 }}
          className="font-mono text-[9px] tracking-wider uppercase"
        >
          {prefix}
        </span>
      )}
      <span style={{ color }} className="truncate">
        {label}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label="remove"
        style={{ background: `${color}22` }}
        className="ml-0.5 inline-flex size-4 cursor-pointer items-center justify-center rounded-full transition hover:brightness-125"
      >
        <svg width="8" height="8" viewBox="0 0 8 8">
          <path d="M1 1l6 6M7 1l-6 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}

// ── LogicToggle — segmenté AND / OR ─────────────────────────────────────────

export function LogicToggle({
  value,
  onChange,
  tone = TONE.cyan,
}: {
  value: 'AND' | 'OR';
  onChange: (v: 'AND' | 'OR') => void;
  tone?: string;
}) {
  return (
    <div
      role="radiogroup"
      className="border-line-subtle bg-surface-sunken/70 inline-flex h-6.5 overflow-hidden rounded border font-mono text-[10px] tracking-wider"
    >
      {(['AND', 'OR'] as const).map((k, i) => {
        const on = k === value;
        return (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(k)}
            style={{
              background: on ? `${tone}1f` : undefined,
              color: on ? tone : undefined,
              borderLeft: i > 0 ? `1px solid ${IDLE_BORDER}` : undefined,
            }}
            className={`px-2 transition focus:outline-none ${on ? '' : 'text-content-subtle'}`}
          >
            {k}
          </button>
        );
      })}
    </div>
  );
}

// ── Toolbar — briques de la barre de filtres ────────────────────────────────
// (extraites de CharactersFiltersBar pour servir aussi /equipment — même
// vocabulaire visuel sur tous les browsers.)

/** Conteneur de la toolbar horizontale (desktop) des barres de filtres. */
export const FILTERS_TOOLBAR_CLASS =
  'border-line-subtle bg-surface-raised/60 flex flex-wrap items-end gap-x-4 gap-y-3 rounded-xl border px-3 py-2.5 backdrop-blur-sm';

/** Champ de la toolbar hors pills (selects…) — assorti à SearchField. */
export const FILTERS_FIELD_CLASS =
  'border-line-subtle bg-surface-sunken/70 text-content focus:border-accent h-9 rounded-lg border px-2 text-sm focus:outline-none';

export function ToolbarDivider() {
  return <span className="bg-line/70 h-9 w-px self-end" aria-hidden />;
}

/** Groupe labellisé (eyebrow centré au-dessus des pills). */
export function BarGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-content-muted text-center font-mono text-[10px] font-semibold tracking-[0.16em] uppercase">
        {label}
      </span>
      <div className="flex flex-wrap items-center justify-center gap-1">{children}</div>
    </div>
  );
}

/** Recherche avec loupe et croix d'effacement. */
export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative flex items-center">
      <svg
        className="text-content-subtle pointer-events-none absolute left-3 size-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-line-subtle bg-surface-sunken/70 text-content placeholder:text-content-subtle focus:border-accent h-9 w-full rounded-lg border pr-8 pl-9 text-sm focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="clear"
          className="text-content-subtle hover:text-content-strong absolute right-2"
        >
          ×
        </button>
      )}
    </div>
  );
}

// ── Eyebrow — petit label mono ──────────────────────────────────────────────

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`text-content-subtle font-mono text-[10px] tracking-[0.16em] uppercase ${className ?? ''}`}
    >
      {children}
    </span>
  );
}
