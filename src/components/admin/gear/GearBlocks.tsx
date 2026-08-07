'use client';

/**
 * Briques d'édition des RECOS D'ÉQUIPEMENT (audit F9) — sorties de
 * `GearRecoEditor`.
 *
 * ⚠ CE DÉCOUPAGE EST UNE PROTECTION, pas seulement du rangement. Ces composants
 * DOIVENT vivre au niveau module : déclarés dans le corps de l'éditeur, leur
 * identité change à chaque rendu et React démonte puis remonte tout leur
 * sous-arbre à CHAQUE frappe — les champs perdent le focus. C'est le bug vécu le
 * 24/07 ailleurs dans l'admin, et la surface que F9 visait à réduire.
 *
 * NB : le gros de `GearRecoEditor` reste dans son fichier — sa logique (édition
 * de tuiles, import de build, résolution debouncée) est indissociable de son
 * état, et l'extraire demanderait de passer une dizaine de props pour un gain de
 * lisibilité douteux. Ce qui sort ici, ce sont les briques réellement autonomes.
 */
import type { GearOption } from '@/lib/admin/gear-options';
import { label } from '../_ui';
export { label };

export const NOTE_LANGS = ['en', 'jp', 'kr', 'zh', 'fr'] as const;
export type NoteLang = (typeof NOTE_LANGS)[number];

export const field =
  'w-full rounded-md border border-line bg-surface-base px-2 py-1 text-sm text-content focus:border-accent focus:outline-none';
export const btn =
  'rounded border border-line px-2 py-0.5 text-xs text-content-subtle hover:text-content';

/** Select d'un équipement (option filtrée + valeur hors-classe réinjectée). */
export function ItemSelect({
  value,
  onChange,
  options,
  allOptions,
}: {
  value: string;
  onChange: (v: string) => void;
  options: GearOption[];
  allOptions?: GearOption[];
}) {
  const missing =
    value && !value.startsWith('!') && !options.some((o) => o.id === value)
      ? (allOptions ?? options).find((o) => o.id === value)
      : undefined;
  return (
    <select className={field} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">—</option>
      {value.startsWith('!') && <option value={value}>⚠ {value.slice(1)} (unresolved)</option>}
      {missing && <option value={missing.id}>{missing.label} (off-class)</option>}
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Multi-select de main stats (puces) — stocké joint par « / ». */
export function MainStatPicker({
  value,
  available,
  onChange,
}: {
  value?: string;
  available: string[];
  onChange: (v: string | undefined) => void;
}) {
  const selected = value
    ? value
        .split('/')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const set = (next: string[]) => onChange(next.length ? next.join('/') : undefined);
  const toggle = (s: string) =>
    set(selected.includes(s) ? selected.filter((x) => x !== s) : [...selected, s]);
  const extras = selected.filter((s) => !available.includes(s));
  if (!available.length && !selected.length)
    return <span className="text-content-subtle px-1 text-[11px]">choose equipment</span>;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {available.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => toggle(s)}
          className={`rounded border px-1.5 py-0.5 text-[11px] ${
            selected.includes(s)
              ? 'border-accent text-accent'
              : 'border-line-subtle text-content-subtle hover:text-content'
          }`}
        >
          {s}
        </button>
      ))}
      {extras.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => toggle(s)}
          title="Value outside pool — click to remove"
          className="border-danger/50 text-danger rounded border px-1.5 py-0.5 text-[11px]"
        >
          {s} ✕
        </button>
      ))}
    </div>
  );
}

/** Tuile placeholder (pick vide / non résolu) — invite à choisir. */
export function EmptyTile({ text = '＋ choose' }: { text?: string }) {
  return (
    <div className="border-line-subtle text-content-subtle flex h-13 items-center gap-2 rounded border border-dashed px-3 text-xs">
      {text}
    </div>
  );
}
