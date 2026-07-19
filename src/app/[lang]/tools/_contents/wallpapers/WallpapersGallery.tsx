'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { wallpaperSrc, wallpaperDownload } from '@/lib/wallpapers';

/** Une entrée wallpaper (schéma de `data/generated/wallpapers.json`). */
interface Wallpaper {
  f: string;
  w: number;
  h: number;
}
export type WallpapersData = Record<string, Wallpaper[]>;

interface CategoryTab {
  key: string;
  label: string;
  count: number;
}

export interface WallpaperStrings {
  description: string;
  download: string;
  disclaimer1: string;
  disclaimer2: string;
  contactLink: string;
}

const HELPSHIFT_URL = 'https://outerplane.helpshift.com/hc/en/4-outerplane/';

/** Catégories en orientation PORTRAIT (grille + lightbox plus étroits). */
const PORTRAIT = new Set(['HeroFullArt', 'Cutin']);

/**
 * Galerie de wallpapers : onglets de catégorie, grille cliquable (badge de
 * résolution) et lightbox (navigation clavier + téléchargement). Portage V2
 * réhabillé sur les tokens V3 (accent ciel conservé, autorisé hors `guides/**`).
 */
export function WallpapersGallery({
  data,
  categories,
  strings,
}: {
  data: WallpapersData;
  categories: CategoryTab[];
  strings: WallpaperStrings;
}) {
  const [selected, setSelected] = useState(categories[0]?.key ?? '');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const isPortrait = PORTRAIT.has(selected);
  const items = useMemo(
    () =>
      (data[selected] ?? []).map((w) => ({
        ...w,
        src: wallpaperSrc(selected, w.f),
        download: wallpaperDownload(selected, w.f),
      })),
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
    <div className="mx-auto max-w-7xl">
      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
        <InfoGlyph className="mt-0.5 size-5 shrink-0 text-amber-400" />
        <div className="flex-1 text-center text-sm text-amber-200/90">
          <p>{strings.disclaimer1}</p>
          <p className="mt-1">
            {strings.disclaimer2}{' '}
            <a
              href={HELPSHIFT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 underline hover:text-amber-200"
            >
              {strings.contactLink}
            </a>
          </p>
        </div>
      </div>

      <p className="text-content-muted mt-4 text-center text-sm">{strings.description}</p>

      {/* Onglets de catégorie */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {categories.map((c) => {
          const active = c.key === selected;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => {
                setSelected(c.key);
                setLightbox(null);
              }}
              className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition ${
                active
                  ? 'border-sky-500/60 bg-sky-500/10 font-medium text-sky-300'
                  : 'border-line-subtle text-content-muted hover:text-content-strong'
              }`}
            >
              {c.label}
              <span
                className={`font-mono text-[10px] tracking-wider ${active ? 'text-sky-300/70' : 'text-content-subtle'}`}
              >
                {c.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grille */}
      <div
        className={`mt-6 grid gap-3 sm:gap-4 ${
          isPortrait
            ? 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
        }`}
      >
        {items.map((w, i) => (
          <button
            key={w.f}
            type="button"
            onClick={() => setLightbox(i)}
            className={`group border-line-subtle bg-surface-raised relative overflow-hidden rounded-lg border transition-all hover:scale-[1.02] hover:border-sky-500 ${
              isPortrait ? 'aspect-3/4' : 'aspect-video'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
            <img
              src={w.src}
              alt={w.f}
              loading="lazy"
              className={`size-full ${isPortrait ? 'object-contain' : 'object-cover'}`}
            />
            <span className="absolute right-1 bottom-1 rounded bg-[#000]/70 px-1.5 py-0.5 font-mono text-[10px] text-[#fff]">
              {w.w}×{w.h}
            </span>
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
            alt={current.f}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[82vh] max-w-[92vw] object-contain"
          />

          <div
            className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="rounded-lg bg-[#000]/70 px-3 py-2 font-mono text-sm text-[#d1d5db]">
              {current.w} × {current.h}
            </span>
            <a
              href={current.download}
              download
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-6 py-3 text-sm font-medium text-[#fff] transition-colors hover:bg-sky-500"
            >
              <DownloadGlyph className="size-5" />
              {strings.download}
            </a>
          </div>
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
function DownloadGlyph({ className }: { className?: string }) {
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
      <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}
