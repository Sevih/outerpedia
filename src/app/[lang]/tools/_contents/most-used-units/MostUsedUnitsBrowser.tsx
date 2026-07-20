'use client';

import { useEffect, useDeferredValue, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname, useRouter } from 'next/navigation';
import { img } from '@/lib/images';
import { CharacterPortrait } from '@/components/character/CharacterPortrait';
import {
  CharactersFiltersBar,
  type FiltersBarLabels,
} from '@/components/character/filters/CharactersFiltersBar';
import { FilterPill } from '@/components/character/filters/FilterPill';

/** Guide où un perso est recommandé (titre déjà localisé côté serveur). */
export interface UsageGuideRef {
  slug: string;
  title: string;
}

/** Ligne du classement : un perso + ses guides groupés par catégorie. */
export interface UsageRow {
  id: string;
  slug: string;
  /** Nom d'affichage COMPLET (préfixe « Core Fusion »/surnom inclus). */
  name: string;
  searchNames: string[];
  element: string;
  class: string;
  rarity: number;
  /** Catégories dans l'ordre canonique d'affichage (clés = slugs de catégorie). */
  categories: Record<string, UsageGuideRef[]>;
  total: number;
}

export interface MostUsedLabels {
  bar: FiltersBarLabels;
  /** Titre du bloc de filtre par catégorie de guide. */
  categoryFilter: string;
  all: string;
  /** Slug de catégorie → libellé localisé (aussi l'univers des pills, ordonné). */
  categories: Record<string, string>;
  /** Valeur → libellé localisé (ligne élément/classe sous le nom). */
  elements: Record<string, string>;
  classes: Record<string, string>;
  /** Unité du compteur par ligne (« guides »). */
  guidesUnit: string;
}

/** Pills de catégorie visibles repliées sur une ligne (le reste en « +N »). */
const MAX_PILLS = 3;

const enc = (arr: string[]) => (arr.length ? arr.join(',') : undefined);

/**
 * Classement des persos les plus recommandés dans les guides (portage V2) :
 * filtres (recherche, élément, classe, rareté + catégorie de guide), lignes
 * dépliables listant les guides par catégorie (liens). Le TOTAL se recalcule
 * sur les seules catégories cochées. URL partageable en params à plat
 * (q/el/cl/r/cat — pas le `?z=` compressé de la V2).
 */
export function MostUsedUnitsBrowser({
  rows,
  labels,
}: {
  rows: UsageRow[];
  labels: MostUsedLabels;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [q, setQ] = useState('');
  const query = useDeferredValue(q);
  const [element, setElement] = useState<string[]>([]);
  const [klass, setKlass] = useState<string[]>([]);
  const [rarity, setRarity] = useState<number[]>([]);
  const [category, setCategory] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const hydrated = useRef(false);
  const lastUrl = useRef('');

  const elements = useMemo(() => [...new Set(rows.map((r) => r.element))].sort(), [rows]);
  const classes = useMemo(() => [...new Set(rows.map((r) => r.class))].sort(), [rows]);
  const rarities = useMemo(
    () => [...new Set(rows.map((r) => r.rarity))].sort((a, b) => b - a),
    [rows],
  );
  const allCategories = useMemo(() => Object.keys(labels.categories), [labels.categories]);

  const toggle =
    <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>) =>
    (value: T) =>
      setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  // ── Hydratation depuis l'URL (au montage) ──
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const p = new URLSearchParams(window.location.search);
    const list = (k: string) => (p.get(k) ? p.get(k)!.split(',').filter(Boolean) : []);
    setQ(p.get('q') ?? '');
    setElement(list('el'));
    setKlass(list('cl'));
    setRarity(
      list('r')
        .map(Number)
        .filter((n) => !Number.isNaN(n)),
    );
    setCategory(list('cat'));
  }, []);

  // ── Sync filtres → URL (débattu) ──
  useEffect(() => {
    if (!hydrated.current) return;
    const params = new URLSearchParams();
    const set = (k: string, v?: string) => v && params.set(k, v);
    set('q', q.trim() || undefined);
    set('el', enc(element));
    set('cl', enc(klass));
    set('r', enc(rarity.map(String)));
    set('cat', enc(category));
    const search = params.toString();
    const url = search ? `${pathname}?${search}` : pathname;
    const handle = setTimeout(() => {
      if (lastUrl.current === url) return;
      lastUrl.current = url;
      // URL dynamique (filtres) → hors du typage des routes statiques de Next.
      router.replace(url as Parameters<typeof router.replace>[0], { scroll: false });
    }, 150);
    return () => clearTimeout(handle);
  }, [q, element, klass, rarity, category, pathname, router]);

  // ── Filtrage (le total suit les catégories cochées) ──
  const filtered = useMemo(() => {
    const needle = query.normalize('NFKC').toLowerCase().trim();
    const elS = new Set(element);
    const clS = new Set(klass);
    const rS = new Set(rarity);
    return rows
      .flatMap((row) => {
        if (needle && !row.searchNames.some((n) => n.includes(needle))) return [];
        if (elS.size && !elS.has(row.element)) return [];
        if (clS.size && !clS.has(row.class)) return [];
        if (rS.size && !rS.has(row.rarity)) return [];
        if (!category.length) return [row];
        const kept = Object.fromEntries(
          Object.entries(row.categories).filter(([cat]) => category.includes(cat)),
        );
        const total = Object.values(kept).reduce((sum, gs) => sum + gs.length, 0);
        return total ? [{ ...row, categories: kept, total }] : [];
      })
      .sort((a, b) => b.total - a.total);
  }, [rows, query, element, klass, rarity, category]);

  return (
    <div className="mx-auto max-w-250 space-y-3">
      {/* Barre : recherche + élément + classe + rareté */}
      <CharactersFiltersBar
        query={q}
        onQueryChange={setQ}
        elements={elements}
        elementFilter={element}
        onToggleElement={toggle(setElement)}
        classes={classes}
        classFilter={klass}
        onToggleClass={toggle(setKlass)}
        rarities={rarities}
        rarityFilter={rarity}
        onToggleRarity={toggle(setRarity)}
        labels={labels.bar}
      />

      {/* Filtre par catégorie de guide */}
      <div className="border-line-subtle bg-surface-raised/60 space-y-2 rounded-xl border p-4">
        <p className="text-content-muted text-center font-mono text-[10px] font-semibold tracking-[0.16em] uppercase">
          {labels.categoryFilter}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <FilterPill
            active={category.length === 0}
            onClick={() => setCategory([])}
            className="h-8 px-3"
          >
            {labels.all}
          </FilterPill>
          {allCategories.map((cat) => (
            <FilterPill
              key={cat}
              active={category.includes(cat)}
              onClick={() => toggle(setCategory)(cat)}
              className="h-8 px-3"
            >
              {labels.categories[cat]}
            </FilterPill>
          ))}
        </div>
      </div>

      {/* Classement */}
      <div className="mt-6 space-y-2">
        {filtered.map((row, index) => {
          const isExpanded = expandedId === row.id;
          const catEntries = Object.entries(row.categories);
          const visiblePills = catEntries.slice(0, MAX_PILLS);
          const extraCount = catEntries.length - MAX_PILLS;

          return (
            <div key={row.id}>
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : row.id)}
                className={`border-line-subtle flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 text-left transition md:gap-4 md:px-4 ${
                  isExpanded
                    ? 'bg-surface-raised/80 rounded-b-none'
                    : 'bg-surface-raised/40 hover:bg-surface-raised/80'
                }`}
              >
                {/* Rang */}
                <span className="text-content-subtle w-8 shrink-0 text-center text-lg font-bold">
                  #{index + 1}
                </span>

                {/* Portrait — conteneur à largeur FIXE : le span racine de
                    CharacterPortrait est en w-full, nu dans une rangée flex il
                    écraserait le bloc nom (flex-1 → 0, contenu en débord). */}
                <span className="w-16 shrink-0">
                  <CharacterPortrait
                    id={row.id}
                    name={row.name}
                    element={row.element}
                    classType={row.class}
                    rarity={row.rarity}
                    size={64}
                    showName={false}
                  />
                </span>

                {/* Nom + élément/classe */}
                <div className="min-w-0 flex-1">
                  <span className="text-content-strong block truncate text-sm font-semibold md:text-base">
                    {row.name}
                  </span>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-content-muted flex items-center gap-1 text-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
                      <img src={img.element(row.element)} alt="" width={16} height={16} />
                      {labels.elements[row.element] ?? row.element}
                    </span>
                    <span className="text-content-muted flex items-center gap-1 text-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
                      <img src={img.klass(row.class)} alt="" width={16} height={16} />
                      {labels.classes[row.class] ?? row.class}
                    </span>
                  </div>
                </div>

                {/* Nombre de guides */}
                <div className="shrink-0 text-center">
                  <span className="text-2xl font-bold text-sky-400 md:text-3xl">{row.total}</span>
                  <span className="text-content-subtle block text-[10px] tracking-wide uppercase">
                    {labels.guidesUnit}
                  </span>
                </div>

                {/* Pills de catégorie (desktop) */}
                <div className="hidden max-w-60 shrink-0 flex-wrap gap-1 md:flex">
                  {visiblePills.map(([cat]) => (
                    <span
                      key={cat}
                      className="bg-surface-sunken/70 text-content-muted rounded px-2 py-0.5 text-[11px]"
                    >
                      {labels.categories[cat] ?? cat}
                    </span>
                  ))}
                  {extraCount > 0 && (
                    <span className="bg-surface-sunken/70 text-content-subtle rounded px-2 py-0.5 text-[11px]">
                      +{extraCount}
                    </span>
                  )}
                </div>

                {/* Chevron */}
                <svg
                  className={`text-content-subtle h-4 w-4 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Détail déplié : guides par catégorie */}
              {isExpanded && (
                <div className="border-line-subtle bg-surface-raised/60 rounded-b-lg border-x border-b px-4 py-3">
                  <div className="space-y-3">
                    {catEntries.map(([cat, guides]) => (
                      <div key={cat}>
                        <h4 className="text-content-muted mb-1 text-xs font-semibold tracking-wide uppercase after:hidden">
                          {labels.categories[cat] ?? cat}
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {guides.map((g) => (
                            <Link
                              key={g.slug}
                              href={`/guides/${cat}/${g.slug}` as Route}
                              className="bg-surface-sunken/70 text-content-muted hover:bg-surface-sunken hover:text-content-strong rounded px-2 py-1 text-xs transition"
                            >
                              {g.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Compteur */}
      <p className="text-content-subtle text-center text-xs">
        {filtered.length} / {rows.length}
      </p>
    </div>
  );
}
