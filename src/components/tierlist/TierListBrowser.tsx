'use client';

import { useEffect, useDeferredValue, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { img } from '@/lib/images';
import { ResponsiveCharacterCard } from '@/components/character/ResponsiveCharacterCard';
import {
  CharactersFiltersBar,
  type FiltersBarLabels,
} from '@/components/character/filters/CharactersFiltersBar';
import { FilterPill } from '@/components/character/filters/FilterPill';
import type { FilterOption } from '@/components/character/filters/AdvancedFiltersPanel';
import { TIERS, TIER_COLORS, type Tier } from './tiers';

/** Niveaux de transcendance sélectionnables (PvE) — 6★ = défaut (= `rank`). */
const TRANSCEND_LEVELS = [3, 4, 5, 6] as const;

/** Ligne allégée pour l'affichage + le filtrage (rang déjà résolu par MODE). */
export interface TierListRow {
  id: string;
  slug: string;
  /** Nom complet localisé (affiché sur la carte). */
  name: string;
  prefix?: string | null;
  /** Noms recherchables (toutes langues + id + slug), déjà normalisés. */
  searchNames: string[];
  element: string;
  class: string;
  rarity: number;
  role?: string;
  tags: string[];
  /** Rang du mode courant (PvE : `rank` 6★ ; PvP : `rankPvp`). */
  rank?: string;
  /** Surcharges par niveau de transcendance (PvE uniquement). */
  rankByTranscend?: Record<string, string>;
  roleByTranscend?: Record<string, string>;
}

export interface TierListBrowserLabels {
  disclaimer: string;
  /** Titre du sélecteur de transcendance (PvE uniquement). */
  transcendLevel?: string;
  charactersCount: string;
  bar: FiltersBarLabels;
  /** Options de rôle (valeur → libellé), ordre canonique — absent = pas de groupe. */
  roles?: FilterOption[];
  /** Légende sous le disclaimer (outils EE) : sens de chaque tier. */
  legend?: { tier: Tier; label: string }[];
}

/** Sérialise une liste en paramètre d'URL (vide → absent). */
const enc = (arr: (string | number)[]) => (arr.length ? arr.join(',') : undefined);

/**
 * Tier list par personnage (portage V2 — PvE/PvP/EE) : barre de filtres
 * (recherche, élément, classe, rareté, rôle si fourni), légende optionnelle
 * (outils EE), sélecteur de transcendance si `withTranscend` (PvE : le
 * rang/rôle d'un perso peut changer avec ses étoiles — repli sur le rang 6★),
 * rangées S→E. Filtres synchronisés à l'URL en paramètres à plat (idiome
 * `CharactersBrowser`, pas le `?z=` compressé de la V2).
 */
export function TierListBrowser({
  rows,
  labels,
  withTranscend = false,
}: {
  rows: TierListRow[];
  labels: TierListBrowserLabels;
  withTranscend?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [q, setQ] = useState('');
  const query = useDeferredValue(q);
  const [element, setElement] = useState<string[]>([]);
  const [klass, setKlass] = useState<string[]>([]);
  const [rarity, setRarity] = useState<number[]>([]);
  const [role, setRole] = useState<string[]>([]);
  const [transcend, setTranscend] = useState(6);

  const hydrated = useRef(false);
  const lastUrl = useRef('');

  const elements = useMemo(() => [...new Set(rows.map((r) => r.element))].sort(), [rows]);
  const classes = useMemo(() => [...new Set(rows.map((r) => r.class))].sort(), [rows]);
  const rarities = useMemo(
    () => [...new Set(rows.map((r) => r.rarity))].sort((a, b) => b - a),
    [rows],
  );

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
    setRole(list('role'));
    const tr = Number(p.get('tr'));
    setTranscend((TRANSCEND_LEVELS as readonly number[]).includes(tr) ? tr : 6);
    // (`tr` n'est écrit que si `withTranscend` — le lire sans est inoffensif.)
  }, []);

  // ── Sync filtres → URL (débattu) ──
  useEffect(() => {
    if (!hydrated.current) return;
    const params = new URLSearchParams();
    const set = (k: string, v?: string) => v && params.set(k, v);
    set('q', q.trim() || undefined);
    set('el', enc(element));
    set('cl', enc(klass));
    set('r', enc(rarity));
    set('role', enc(role));
    if (withTranscend && transcend !== 6) set('tr', String(transcend));
    const search = params.toString();
    const url = search ? `${pathname}?${search}` : pathname;
    const handle = setTimeout(() => {
      if (lastUrl.current === url) return;
      lastUrl.current = url;
      // URL dynamique (filtres) → hors du typage des routes statiques de Next.
      router.replace(url as Parameters<typeof router.replace>[0], { scroll: false });
    }, 150);
    return () => clearTimeout(handle);
  }, [q, element, klass, rarity, role, transcend, withTranscend, pathname, router]);

  // ── Rang/rôle résolus au niveau de transcendance courant ──
  const resolved = useMemo(() => {
    if (!withTranscend) return rows;
    const lvl = String(transcend);
    return rows.map((r) => ({
      ...r,
      rank: r.rankByTranscend?.[lvl] ?? r.rank,
      role: r.roleByTranscend?.[lvl] ?? r.role,
    }));
  }, [rows, withTranscend, transcend]);

  // ── Filtrage ──
  const filtered = useMemo(() => {
    const needle = query.normalize('NFKC').toLowerCase().trim();
    const elS = new Set(element);
    const clS = new Set(klass);
    const rS = new Set(rarity);
    const roS = new Set(role);
    return resolved.filter((row) => {
      if (needle && !row.searchNames.some((n) => n.includes(needle))) return false;
      if (elS.size && !elS.has(row.element)) return false;
      if (clS.size && !clS.has(row.class)) return false;
      if (rS.size && !rS.has(row.rarity)) return false;
      if (roS.size && (!row.role || !roS.has(row.role))) return false;
      return true;
    });
  }, [resolved, query, element, klass, rarity, role]);

  // ── Groupement par tier (tri alphabétique dans chaque rangée) ──
  const grouped = useMemo(() => {
    const map = new Map<Tier, TierListRow[]>();
    for (const tier of TIERS) map.set(tier, []);
    for (const row of filtered) {
      const tier = row.rank as Tier;
      if (map.has(tier)) map.get(tier)!.push(row);
    }
    for (const list of map.values()) list.sort((a, b) => a.name.localeCompare(b.name));
    return map;
  }, [filtered]);

  return (
    <div className="mx-auto max-w-350 space-y-3">
      {/* Avertissement */}
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-200/90">
        <span className="mr-1.5">⚠️</span>
        {labels.disclaimer}
      </div>

      {/* Légende des tiers (outils EE) */}
      {labels.legend && labels.legend.length > 0 && (
        <div className="text-content-muted flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
          {labels.legend.map(({ tier, label }) => (
            <div key={tier} className="flex items-center gap-1">
              <img src={img.rank(tier)} alt={tier} width={20} height={20} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Barre : recherche + élément + classe + rareté + rôles */}
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
        roles={labels.roles}
        roleFilter={role}
        onToggleRole={toggle(setRole)}
        labels={labels.bar}
      />

      {/* Sélecteur de transcendance — rangée centrée dédiée (PvE) */}
      {withTranscend && (
        <div className="border-line-subtle bg-surface-raised/60 flex flex-col items-center gap-2 rounded-xl border p-4">
          <p className="text-content-muted text-center font-mono text-[10px] font-semibold tracking-[0.16em] uppercase">
            {labels.transcendLevel}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {TRANSCEND_LEVELS.map((lvl) => (
              <FilterPill
                key={lvl}
                active={transcend === lvl}
                onClick={() => setTranscend(lvl)}
                className="h-8 px-3"
              >
                <span className="flex items-center -space-x-1">
                  {Array.from({ length: lvl }, (_, i) => (
                    <img key={i} src={img.star()} alt="" aria-hidden width={16} height={16} />
                  ))}
                </span>
              </FilterPill>
            ))}
          </div>
        </div>
      )}

      {/* Rangées de tiers */}
      <div className="mt-6 space-y-4">
        {TIERS.map((tier) => {
          const chars = grouped.get(tier);
          if (!chars || chars.length === 0) return null;
          return (
            <div
              key={tier}
              className={`rounded-xl border bg-linear-to-r ${TIER_COLORS[tier]} overflow-hidden`}
            >
              <div className="flex items-center gap-3">
                {/* Glyphe de rang */}
                <div className="flex min-h-20 w-16 shrink-0 items-center justify-center md:w-20">
                  <img
                    src={img.rank(tier)}
                    alt={`Tier ${tier}`}
                    className="size-12 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] md:size-14"
                    width={48}
                    height={48}
                  />
                </div>

                {/* Grille de personnages */}
                <div className="flex flex-wrap gap-2 py-3 pr-3 lg:gap-3">
                  {chars.map((row, index) => (
                    <ResponsiveCharacterCard
                      key={row.id}
                      id={row.id}
                      name={row.name}
                      prefix={row.prefix}
                      element={row.element}
                      classType={row.class}
                      rarity={withTranscend ? transcend : row.rarity}
                      tags={row.tags}
                      href={`/characters/${row.slug}`}
                      starAriaLabel={labels.bar.starAria}
                      sizes={{ base: 'sm', md: 'sm', lg: 'md' }}
                      priority={tier === 'S' && index <= 5}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compteur */}
      <p className="text-content-subtle text-center text-xs">
        {filtered.length} {labels.charactersCount}
      </p>
    </div>
  );
}
