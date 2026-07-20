'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { FilterPill } from '@/components/character/filters/FilterPill';
import { prefixAssetSrcs } from '@/lib/images';

export type Era = 'major9' | 'smilegate';

/** Un post scrapé (major9 : getNews ; legacy : archive Stove figée). */
export interface PatchPost {
  id: number | string;
  date: string;
  slug: string;
  type: string;
  title: string;
  content: string;
}

export interface PatchHistoryLabels {
  eras: Record<Era, string>;
  /** Libellés de type (les 12, deux ères confondues). */
  types: Record<string, string>;
  all: string;
  search: string;
  loading: string;
  zhFallback: string;
  legacyEnOnly: string;
}

const MAJOR9_TYPES = ['update', 'notice', 'event', 'devnote', 'known-issue'];
const LEGACY_TYPES = [
  'patchnotes',
  'event',
  'developer-notes',
  'compendium',
  'media-archives',
  'official-4-cut-cartoon',
  'probabilities',
  'world-introduction',
];

/** Couleur de badge par type (couleurs de donnée, parité V2). */
const TYPE_COLORS: Record<string, string> = {
  update: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  notice: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  event: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  devnote: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'known-issue': 'bg-red-500/20 text-red-300 border-red-500/30',
  patchnotes: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'developer-notes': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  compendium: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'media-archives': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'official-4-cut-cartoon': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  probabilities: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'world-introduction': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
};

const POSTS_PER_PAGE = 10;

// L'archive legacy (2,8 Mo, EN only, figée) n'est PAS dans le bundle initial :
// chunk séparé chargé au premier passage sur l'ère Smilegate (ou via un hash
// qui y pointe). Promesse mémoïsée — un seul fetch quoi qu'il arrive.
let legacyPromise: Promise<PatchPost[]> | null = null;
function loadLegacy(): Promise<PatchPost[]> {
  legacyPromise ??= import('@data/patch-notes/legacy-posts.json').then(
    (m) => (m.default as { posts: PatchPost[] }).posts,
  );
  return legacyPromise;
}

/**
 * Historique des patch notes (portage V2) : deux ères — Major9 (scrape getNews,
 * langue courante) et Smilegate (archive Stove EN, chargée à la demande) —
 * filtre par type, recherche titre+contenu, pagination, posts dépliables
 * (HTML WordPress stocké, `src` préfixés à l'affichage). L'URL porte l'état
 * partageable : `?era=&type=` + `#slug` (auto-dépliage au chargement).
 */
export function PatchHistoryBrowser({
  posts,
  labels,
  fallbackToEn,
  isEn,
}: {
  /** Posts major9 de la langue courante (déjà filtrés côté serveur). */
  posts: PatchPost[];
  labels: PatchHistoryLabels;
  /** La langue du site n'a pas de posts (zh, fr) : on sert l'anglais. */
  fallbackToEn: boolean;
  isEn: boolean;
}) {
  const [era, setEra] = useState<Era>('major9');
  const [legacy, setLegacy] = useState<PatchPost[] | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const query = useDeferredValue(q);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | string | null>(null);

  // Hydratation depuis l'URL (?era=&type= + #slug) : le rendu serveur part de
  // l'état par défaut, l'état partagé s'applique au montage (une seule fois —
  // même patron que TierListBrowser).
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const params = new URLSearchParams(window.location.search);
    const urlEra: Era = params.get('era') === 'smilegate' ? 'smilegate' : 'major9';
    const urlType = params.get('type');
    const valid = urlEra === 'major9' ? MAJOR9_TYPES : LEGACY_TYPES;
    const hash = decodeURIComponent(window.location.hash.slice(1));
    // Auto-dépliage du post ciblé par le hash : major9 d'abord — un hash connu
    // prime sur ?era/?type (il désigne un post précis).
    const i = hash ? posts.findIndex((p) => p.slug === hash) : -1;
    setEra(i >= 0 ? 'major9' : urlEra);
    setTypeFilter(i >= 0 || !urlType || !valid.includes(urlType) ? null : urlType);
    setPage(i >= 0 ? Math.floor(i / POSTS_PER_PAGE) + 1 : 1);
    setExpandedId(i >= 0 ? posts[i].id : null);
    if (i >= 0 || !hash) return;
    // Introuvable en major9 : le hash peut cibler l'archive legacy.
    void loadLegacy().then((lg) => {
      setLegacy(lg);
      const j = lg.findIndex((p) => p.slug === hash);
      if (j >= 0) {
        setEra('smilegate');
        setTypeFilter(null);
        setPage(Math.floor(j / POSTS_PER_PAGE) + 1);
        setExpandedId(lg[j].id);
      }
    });
  }, [posts]);

  const updateUrl = (newEra: Era, newType: string | null, hash?: string) => {
    const params = new URLSearchParams();
    if (newEra !== 'major9') params.set('era', newEra);
    if (newType) params.set('type', newType);
    const qs = params.toString();
    history.replaceState(
      null,
      '',
      window.location.pathname + (qs ? `?${qs}` : '') + (hash ?? window.location.hash),
    );
  };

  const switchEra = (e: Era) => {
    setEra(e);
    setTypeFilter(null);
    setQ('');
    setExpandedId(null);
    setPage(1);
    updateUrl(e, null, '');
    if (e === 'smilegate' && !legacy) void loadLegacy().then(setLegacy);
  };

  const toggleType = (type: string | null) => {
    const next = type === typeFilter ? null : type;
    setTypeFilter(next);
    setPage(1);
    updateUrl(era, next);
  };

  const toggleExpand = (post: PatchPost) => {
    const collapsing = expandedId === post.id;
    setExpandedId(collapsing ? null : post.id);
    updateUrl(era, typeFilter, collapsing ? '' : `#${post.slug}`);
  };

  const currentTypes = era === 'major9' ? MAJOR9_TYPES : LEGACY_TYPES;
  const legacyLoading = era === 'smilegate' && legacy === null;

  const filtered = useMemo(() => {
    let list = era === 'major9' ? posts : (legacy ?? []);
    if (typeFilter) list = list.filter((p) => p.type === typeFilter);
    const needle = query.trim().toLowerCase();
    if (needle)
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(needle) ||
          p.content
            .replace(/<[^>]*>/g, '')
            .toLowerCase()
            .includes(needle),
      );
    return list;
  }, [era, posts, legacy, typeFilter, query]);

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const pagePosts = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);
  // Fenêtre de pagination glissante (10 numéros max autour de la page courante).
  let windowStart = Math.max(1, page - 4);
  if (Math.min(totalPages, windowStart + 9) - windowStart < 9)
    windowStart = Math.max(1, Math.min(totalPages, windowStart + 9) - 9);
  const pageNumbers = Array.from({ length: Math.min(totalPages, 10) }, (_, i) => windowStart + i);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* Ères */}
      <div className="flex justify-center gap-2">
        {(['major9', 'smilegate'] as const).map((e) => (
          <FilterPill key={e} active={era === e} onClick={() => switchEra(e)} className="h-9 px-4">
            {labels.eras[e]}
          </FilterPill>
        ))}
      </div>

      {/* Bandeaux de langue */}
      {fallbackToEn && era === 'major9' && (
        <div className="border-warn/30 bg-warn/10 text-warn rounded-lg border px-4 py-3 text-center text-sm">
          {labels.zhFallback}
        </div>
      )}
      {era === 'smilegate' && !isEn && (
        <div className="border-warn/30 bg-warn/10 text-warn rounded-lg border px-4 py-3 text-center text-sm">
          {labels.legacyEnOnly}
        </div>
      )}

      {/* Recherche */}
      <input
        type="text"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setPage(1);
        }}
        placeholder={labels.search}
        className="border-line-subtle bg-surface-sunken/70 text-content placeholder:text-content-subtle focus:border-accent w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none"
      />

      {/* Types */}
      <div className="flex flex-wrap justify-center gap-2">
        <FilterPill
          active={typeFilter === null}
          onClick={() => toggleType(null)}
          className="h-8 px-3"
        >
          {labels.all}
        </FilterPill>
        {currentTypes.map((type) => (
          <FilterPill
            key={type}
            active={typeFilter === type}
            onClick={() => toggleType(type)}
            className="h-8 px-3"
          >
            {labels.types[type] ?? type}
          </FilterPill>
        ))}
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {legacyLoading && <p className="text-content-subtle py-12 text-center">{labels.loading}</p>}
        {pagePosts.map((post) => (
          <article
            key={post.id}
            className="border-line-subtle bg-surface-raised/50 rounded-lg border"
          >
            <button
              type="button"
              onClick={() => toggleExpand(post)}
              className="hover:bg-surface-overlay/30 flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition"
            >
              <span
                className={`shrink-0 rounded border px-2 py-0.5 text-xs font-medium ${
                  TYPE_COLORS[post.type] ??
                  'bg-surface-sunken/50 text-content-muted border-line-subtle'
                }`}
              >
                {labels.types[post.type] ?? post.type}
              </span>
              <span className="text-content min-w-0 flex-1 truncate text-sm">{post.title}</span>
              <time className="text-content-subtle shrink-0 text-xs">{post.date}</time>
              <svg
                className={`text-content-subtle h-4 w-4 shrink-0 transition-transform ${expandedId === post.id ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedId === post.id && (
              <div className="border-line-subtle border-t px-4 py-4">
                <div
                  className="patch-note-content"
                  // HTML WordPress scrapé par NOS scripts (donnée committée du
                  // repo) ; les `src` relatifs pointent la base d'assets.
                  dangerouslySetInnerHTML={{ __html: prefixAssetSrcs(post.content) }}
                />
              </div>
            )}
          </article>
        ))}
        {!legacyLoading && filtered.length === 0 && (
          <p className="text-content-subtle py-12 text-center">—</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="border-line-subtle text-content-muted hover:bg-surface-raised cursor-pointer rounded border px-3 py-1.5 text-sm transition disabled:cursor-default disabled:opacity-30"
          >
            «
          </button>
          {pageNumbers
            .filter((p) => p <= totalPages)
            .map((p) => (
              <FilterPill
                key={p}
                active={p === page}
                onClick={() => setPage(p)}
                className="h-8 px-3"
              >
                {p}
              </FilterPill>
            ))}
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="border-line-subtle text-content-muted hover:bg-surface-raised cursor-pointer rounded border px-3 py-1.5 text-sm transition disabled:cursor-default disabled:opacity-30"
          >
            »
          </button>
        </div>
      )}
    </div>
  );
}
