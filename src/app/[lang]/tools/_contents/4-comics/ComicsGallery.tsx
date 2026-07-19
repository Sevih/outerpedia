'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { comicSrc } from '@/lib/comics';

/** Catalogue des BD par langue d'origine (schéma de `comics.json`). */
export type ComicsData = Record<string, string[]>;

interface LangTab {
  key: string;
  label: string;
  count: number;
}

export interface ComicStrings {
  description: string;
  credit: string;
}

/**
 * Galerie de 4-cut comics : onglets de langue d'origine, grille portrait
 * cliquable et lightbox (navigation clavier). BD faites main, servies depuis R2
 * (`comicSrc`). Réhabillage V3 (accent ciel, autorisé hors `guides/**`).
 */
export function ComicsGallery({
  data,
  languages,
  strings,
}: {
  data: ComicsData;
  languages: LangTab[];
  strings: ComicStrings;
}) {
  const [selected, setSelected] = useState(languages[0]?.key ?? '');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const items = useMemo(
    () => (data[selected] ?? []).map((stem) => ({ stem, src: comicSrc(selected, stem) })),
    [data, selected],
  );

  const close = useCallback(() => setLightbox(null), []);
  const nav = useCallback(
    (dir: 1 | -1) => setLightbox((i) => (i === null ? i : (i + dir + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') nav(-1);
      else if (e.key === 'ArrowRight') nav(1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, close, nav]);

  const current = lightbox !== null ? items[lightbox] : null;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Crédit */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
        <InfoGlyph className="mt-0.5 size-5 shrink-0 text-amber-400" />
        <p className="flex-1 text-center text-sm text-amber-200/90">{strings.credit}</p>
      </div>

      <p className="text-content-muted mt-4 text-center text-sm">{strings.description}</p>

      {/* Onglets de langue */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {languages.map((l) => {
          const active = l.key === selected;
          return (
            <button
              key={l.key}
              type="button"
              onClick={() => {
                setSelected(l.key);
                setLightbox(null);
              }}
              className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition ${
                active
                  ? 'border-sky-500/60 bg-sky-500/10 font-medium text-sky-300'
                  : 'border-line-subtle text-content-muted hover:text-content-strong'
              }`}
            >
              {l.label}
              <span
                className={`font-mono text-[10px] tracking-wider ${active ? 'text-sky-300/70' : 'text-content-subtle'}`}
              >
                {l.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grille */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {items.map((c, i) => (
          <button
            key={c.stem}
            type="button"
            onClick={() => setLightbox(i)}
            className="group border-line-subtle bg-surface-raised relative aspect-3/4 overflow-hidden rounded-lg border transition-all hover:scale-[1.02] hover:border-sky-500"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
            <img src={c.src} alt={c.stem} loading="lazy" className="size-full object-contain" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {current && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-[#000]/95 p-4"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 p-2 text-[#fff]/70 transition-colors hover:text-[#fff]"
          >
            <CloseGlyph className="size-8" />
          </button>
          <div className="absolute top-4 left-4 z-10 text-sm text-[#fff]/70">
            {lightbox! + 1} / {items.length}
          </div>

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nav(-1);
                }}
                aria-label="Previous"
                className="absolute top-1/2 left-4 z-10 -translate-y-1/2 p-2 text-[#fff]/50 transition-colors hover:text-[#fff]"
              >
                <ChevronGlyph className="size-10 rotate-180" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nav(1);
                }}
                aria-label="Next"
                className="absolute top-1/2 right-4 z-10 -translate-y-1/2 p-2 text-[#fff]/50 transition-colors hover:text-[#fff]"
              >
                <ChevronGlyph className="size-10" />
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
          <img
            src={current.src}
            alt={current.stem}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] max-w-[92vw] object-contain"
          />
        </div>
      )}
    </div>
  );
}

/* --- Glyphes ---------------------------------------------------------------- */

function InfoGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
function CloseGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function ChevronGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}
