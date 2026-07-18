'use client';

/* eslint-disable @next/next/no-img-element -- sprites dev (staging / .gamedata) */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';

export interface ExtractorRow {
  /** Clé de route (`basePath/<id>`) — encodée à l'affichage. */
  id: string;
  name: string;
  /** Ligne secondaire, après l'id (mode de jeu, grade…). */
  meta?: string;
  /** Troisième ligne (stage/zone, détail de contexte). */
  sub?: string;
  /** URL d'icône (FI_/MT_/sprite d'équipement) — masquée si 404. */
  icon?: string;
  /** Fond de slot derrière l'icône (rareté d'item, hiérarchie de monstre). */
  iconFrame?: string;
  /** Icône posée en RETRAIT du cadre (slots à bordure intégrée, GD_Slot_Bg_*). */
  iconInset?: boolean;
  /** Surimpressions du portrait (géométrie CharacterPortrait) : élément en
   * haut à droite, classe à droite au milieu, badge (BOSS) en haut à gauche. */
  elementIcon?: string;
  classIcon?: string;
  badgeIcon?: string;
  /** Étoiles (rareté), si pertinent. */
  stars?: number;
  status?: 'new' | 'diff' | 'ok';
  /** Compteur d'écarts (diff extraction, issues V2…), affiché sur le badge. */
  count?: number;
  /** Petit glyphe accent après le statut (ex. « ✎ » = entité curée). */
  marker?: string;
  /** Marqueurs booléens filtrables par `toggles` (« site »…). */
  flags?: string[];
  /** Étiquettes filtrables par `tagFilter` (slugs de mode de jeu…). */
  tags?: string[];
}

/** Case à cocher de filtre : ne garde que les lignes portant `flag`. */
export interface ToggleFilter {
  flag: string;
  label: string;
  defaultOn?: boolean;
}

/** Filtre par étiquette (select) : ne garde que les lignes portant le tag choisi. */
export interface TagFilter {
  /** Libellé de l'option « toutes » (« tous les modes »). */
  allLabel: string;
  options: Array<{ value: string; label: string }>;
}

const FILTERS = ['all', 'diff', 'new', 'ok'] as const;
type Filter = (typeof FILTERS)[number];

/** Au-delà, on demande d'affiner (les monstres = 4382 lignes). */
const MAX_RENDERED = 250;

/**
 * Liste latérale GÉNÉRIQUE des extracteurs (même UX que les persos : recherche,
 * filtres de statut, clic → fiche). Icônes servies par le staging ou par
 * `/api/admin/sprite/*` (sprites bruts du jeu) — masquées si absentes.
 */
export function ExtractorSidebar({
  rows,
  basePath,
  toggles,
  tagFilter,
  iconSize = 32,
}: {
  rows: ExtractorRow[];
  basePath: string;
  /** Cases à cocher de filtre par flag (« Utilisés par le site »…). */
  toggles?: ToggleFilter[];
  /** Filtre par étiquette (mode de jeu…). */
  tagFilter?: TagFilter;
  /** Côté du portrait en px (les overlays élément/classe suivent, le badge
   * BOSS garde sa taille). */
  iconSize?: number;
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [activeToggles, setActiveToggles] = useState<Set<string>>(
    () => new Set((toggles ?? []).filter((t) => t.defaultOn).map((t) => t.flag)),
  );
  const [tag, setTag] = useState('');
  const pathname = usePathname();

  const hasStatus = rows.some((r) => r.status);

  const stats = useMemo(
    () => ({
      total: rows.length,
      ok: rows.filter((r) => r.status === 'ok').length,
      diff: rows.filter((r) => r.status === 'diff').length,
      new: rows.filter((r) => r.status === 'new').length,
    }),
    [rows],
  );

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return rows
      .filter((r) => (filter === 'all' ? true : r.status === filter))
      .filter((r) => [...activeToggles].every((f) => r.flags?.includes(f)))
      .filter((r) => !tag || r.tags?.includes(tag))
      .filter(
        (r) =>
          !s ||
          r.id.toLowerCase().includes(s) ||
          r.name.toLowerCase().includes(s) ||
          (r.meta ?? '').toLowerCase().includes(s) ||
          (r.sub ?? '').toLowerCase().includes(s),
      )
      .sort((a, b) => {
        const p = (r: ExtractorRow) => (r.status === 'diff' ? 0 : r.status === 'new' ? 1 : 2);
        if (p(a) !== p(b)) return p(a) - p(b);
        if ((a.count ?? 0) !== (b.count ?? 0)) return (b.count ?? 0) - (a.count ?? 0);
        return a.id.localeCompare(b.id, undefined, { numeric: true });
      });
  }, [rows, search, filter, activeToggles, tag]);

  return (
    <aside className="border-line-subtle sticky top-6 flex h-[calc(100dvh-7.5rem)] w-72 shrink-0 flex-col self-start overflow-hidden rounded-lg border">
      <div className="border-line-subtle space-y-2 border-b p-3">
        <div className="flex gap-2 text-xs">
          <span className="text-content-subtle">{stats.total} total</span>
          {hasStatus && (
            <>
              <span className="text-success">{stats.ok} ok</span>
              <span className="text-warn">{stats.diff} diff</span>
              <span className="text-accent">{stats.new} new</span>
            </>
          )}
        </div>
        <input
          className="border-line bg-surface-base text-content focus:border-accent w-full rounded-md border px-2 py-1 text-sm focus:outline-none"
          placeholder="Nom ou id…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {hasStatus && (
          <div className="flex gap-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded px-2 py-0.5 text-xs ${
                  filter === f
                    ? 'bg-surface-overlay text-content-strong'
                    : 'text-content-subtle hover:text-content'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
        {(toggles?.length || tagFilter) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            {(toggles ?? []).map((t) => (
              <label key={t.flag} className="text-content-subtle flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={activeToggles.has(t.flag)}
                  onChange={(e) => {
                    const next = new Set(activeToggles);
                    if (e.target.checked) next.add(t.flag);
                    else next.delete(t.flag);
                    setActiveToggles(next);
                  }}
                />
                {t.label}
              </label>
            ))}
            {tagFilter && (
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="border-line bg-surface-base text-content max-w-full rounded-md border px-1 py-0.5"
              >
                <option value="">{tagFilter.allLabel}</option>
                {tagFilter.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      <ul className="divide-line-subtle min-h-0 flex-1 divide-y overflow-y-auto text-sm">
        {filtered.slice(0, MAX_RENDERED).map((r) => {
          const href = `${basePath}/${encodeURIComponent(r.id)}` as Route;
          const active = pathname === href;
          return (
            <li key={r.id}>
              <Link
                href={href}
                className={`flex items-center gap-2 px-3 py-1.5 ${active ? 'bg-surface-overlay' : 'hover:bg-surface-overlay/50'}`}
              >
                {r.icon && (
                  <span className="relative shrink-0" style={{ width: iconSize, height: iconSize }}>
                    {r.iconFrame && (
                      <img
                        src={r.iconFrame}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 h-full w-full rounded object-cover"
                      />
                    )}
                    <img
                      src={r.icon}
                      alt=""
                      loading="lazy"
                      className={`absolute rounded object-contain ${r.iconInset ? 'inset-[7%] h-[86%] w-[86%]' : 'inset-0 h-full w-full'}`}
                      onError={(e) => {
                        e.currentTarget.style.visibility = 'hidden';
                      }}
                    />
                    {r.elementIcon && (
                      <img
                        src={r.elementIcon}
                        alt=""
                        loading="lazy"
                        className="absolute -top-1 -right-1 h-[42%] w-[42%] drop-shadow-md"
                      />
                    )}
                    {r.classIcon && (
                      <img
                        src={r.classIcon}
                        alt=""
                        loading="lazy"
                        className="absolute top-[42%] -right-0.5 h-[32%] w-[32%] drop-shadow-md"
                      />
                    )}
                    {r.badgeIcon && (
                      <img
                        src={r.badgeIcon}
                        alt="boss"
                        loading="lazy"
                        className="absolute -top-1 -left-1 h-3 w-auto drop-shadow-md"
                      />
                    )}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-1">
                    <span className="text-content truncate">{r.name}</span>
                    <span className="flex shrink-0 items-center gap-1">
                      {r.status === 'new' && (
                        <span className="bg-accent/15 text-accent rounded px-1 text-[10px]">
                          new
                        </span>
                      )}
                      {r.status === 'diff' && (
                        <span className="bg-warn/15 text-warn rounded px-1 text-[10px]">
                          {r.count ? `${r.count} ` : ''}diff
                        </span>
                      )}
                      {r.status === 'ok' && (
                        <span className="bg-success/15 text-success rounded px-1 text-[10px]">
                          ok
                        </span>
                      )}
                      {r.marker && <span className="text-accent text-[10px]">{r.marker}</span>}
                    </span>
                  </span>
                  <span className="text-content-subtle flex items-center gap-1 text-xs">
                    <span className="font-mono">{r.id}</span>
                    {r.meta && <span className="truncate">· {r.meta}</span>}
                    {r.stars ? <span className="text-light">{'★'.repeat(r.stars)}</span> : null}
                  </span>
                  {r.sub && (
                    <span className="text-content-subtle block truncate text-xs">{r.sub}</span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
        {filtered.length > MAX_RENDERED && (
          <li className="text-content-subtle px-3 py-2 text-xs">
            … {filtered.length - MAX_RENDERED} de plus — affine la recherche.
          </li>
        )}
      </ul>
    </aside>
  );
}
