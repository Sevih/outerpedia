'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import type { SearchEntry, SearchKind } from '@/lib/search-index';

export interface SearchStrings {
  placeholder: string;
  noResults: string;
  pages: string;
  characters: string;
  guides: string;
}

/** Ordre des groupes dans les résultats (aligné sur l'ordre des libellés i18n). */
const KIND_ORDER: SearchKind[] = ['page', 'character', 'guide'];
/** Résultats affichés par groupe (au-delà, on tape plus précis). */
const PER_GROUP = 8;

// L'index ne change pas d'une ouverture à l'autre : on le mémorise au niveau
// module (par langue) et on dédoublonne les requêtes concurrentes.
const indexCache = new Map<string, SearchEntry[]>();
const inflight = new Map<string, Promise<SearchEntry[]>>();

async function loadIndex(lang: string): Promise<SearchEntry[]> {
  const cached = indexCache.get(lang);
  if (cached) return cached;
  let p = inflight.get(lang);
  if (!p) {
    p = fetch(`/api/search?lang=${lang}`)
      .then((r) => r.json() as Promise<SearchEntry[]>)
      .then((data) => {
        indexCache.set(lang, data);
        inflight.delete(lang);
        return data;
      })
      .catch((e) => {
        inflight.delete(lang);
        throw e;
      });
    inflight.set(lang, p);
  }
  return p;
}

/** Minuscule + sans diacritiques : « Éclair » ⊃ « eclair ». */
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

/**
 * Palette de recherche globale (Ctrl+K) : charge l'index à la 1re ouverture,
 * filtre en accent-insensible, groupe par nature, navigation clavier complète
 * (↑↓ pour parcourir, Entrée pour ouvrir, Échap pour fermer).
 */
export function SearchModal({
  lang,
  strings,
  onClose,
}: {
  lang: string;
  strings: SearchStrings;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<SearchEntry[]>(() => indexCache.get(lang) ?? []);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  // Chargement de l'index (idempotent : cache module).
  useEffect(() => {
    let alive = true;
    loadIndex(lang)
      .then((data) => {
        if (alive) setEntries(data);
      })
      .catch(() => {
        /* réseau : on garde l'index vide, la palette reste utilisable */
      });
    return () => {
      alive = false;
    };
  }, [lang]);

  // Focus à l'ouverture + verrou du scroll de fond.
  useEffect(() => {
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const groups = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return [] as { kind: SearchKind; items: SearchEntry[] }[];
    const toks = q.split(/\s+/);
    const match = (e: SearchEntry) => {
      const n = norm(e.label);
      return toks.every((tk) => n.includes(tk));
    };
    const hits = entries.filter(match);
    return KIND_ORDER.map((kind) => ({
      kind,
      items: hits.filter((e) => e.kind === kind).slice(0, PER_GROUP),
    })).filter((g) => g.items.length);
  }, [query, entries]);

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const activeHref = flat[Math.min(active, flat.length - 1)]?.href;

  const go = (href: string) => {
    onClose();
    router.push(href as Route);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown' && flat.length) {
      e.preventDefault();
      setActive((a) => (a + 1) % flat.length);
    } else if (e.key === 'ArrowUp' && flat.length) {
      e.preventDefault();
      setActive((a) => (a - 1 + flat.length) % flat.length);
    } else if (e.key === 'Enter' && activeHref) {
      e.preventDefault();
      go(activeHref);
    }
  };

  const KIND_LABEL: Record<SearchKind, string> = {
    page: strings.pages,
    character: strings.characters,
    equipment: strings.characters, // repli : l'équipement n'entre pas encore dans l'index
    guide: strings.guides,
  };

  return (
    <div
      className="fixed inset-0 z-9999 flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label={strings.placeholder}
    >
      {/* Voile */}
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        className="bg-surface-sunken/70 absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <div className="border-line bg-surface-raised relative z-10 flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border shadow-2xl">
        {/* Barre de saisie */}
        <div className="border-line-subtle flex items-center gap-2 border-b px-3.5 py-3">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="text-content-subtle shrink-0"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={strings.placeholder}
            aria-label={strings.placeholder}
            className="text-content-strong placeholder:text-content-subtle min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          <kbd className="border-line text-content-subtle hidden rounded border px-1.5 py-0.5 font-mono text-[10px] sm:inline-block">
            Esc
          </kbd>
        </div>

        {/* Résultats */}
        <div className="min-h-0 flex-1 overflow-y-auto py-1.5">
          {query.trim() && flat.length === 0 ? (
            <p className="text-content-muted px-4 py-6 text-center text-sm">{strings.noResults}</p>
          ) : (
            groups.map((group) => (
              <div key={group.kind} className="py-1">
                <div className="text-content-subtle px-4 pb-1 text-[11px] font-semibold tracking-wide uppercase">
                  {KIND_LABEL[group.kind]}
                </div>
                {group.items.map((entry) => {
                  const idx = flat.indexOf(entry);
                  const isActive = entry.href === activeHref;
                  return (
                    <button
                      key={`${entry.kind}:${entry.href}`}
                      type="button"
                      onMouseMove={() => setActive(idx)}
                      onClick={() => go(entry.href)}
                      className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                        isActive ? 'bg-surface-overlay text-content-strong' : 'text-content-muted'
                      }`}
                    >
                      {entry.icon ? (
                        <img
                          src={entry.icon}
                          alt=""
                          aria-hidden
                          className="bg-surface-overlay size-6 shrink-0 rounded object-contain"
                          width={24}
                          height={24}
                        />
                      ) : (
                        <span className="bg-surface-overlay size-6 shrink-0 rounded" aria-hidden />
                      )}
                      <span className="truncate">{entry.label}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
