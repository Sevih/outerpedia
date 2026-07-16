'use client';

import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Vignette cliquable → image plein écran (portage V2, tokens V3).
 * La brique des screenshots éditoriaux de guides (roadmap, schémas…) :
 * la miniature reste compacte dans l'article, le plein écran rend le
 * texte des captures lisible. Échap ou clic hors image pour fermer.
 */
export function ImageLightbox({
  src,
  alt,
  caption,
  className,
  thumbnailClassName,
}: {
  src: string;
  alt: string;
  caption?: string;
  /** Classes du conteneur figure. */
  className?: string;
  /** Classes de la miniature (défaut : max-h-48 w-auto). */
  thumbnailClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  return (
    <>
      <figure className={cn('flex flex-col items-center gap-2', className)}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="cursor-zoom-in focus:outline-none"
          aria-label={`Zoom: ${alt}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
          <img
            src={src}
            alt={alt}
            className={cn(
              'rounded-lg transition-opacity hover:opacity-80',
              thumbnailClassName ?? 'max-h-48 w-auto',
            )}
            loading="lazy"
          />
        </button>
        {caption && (
          <figcaption className="text-content-muted text-center text-xs">{caption}</figcaption>
        )}
      </figure>

      {open && (
        <div
          className="bg-surface-sunken/80 fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <div className="relative max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={close}
              className="bg-surface-overlay text-content-strong hover:bg-surface-raised absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full transition"
              aria-label="Close"
            >
              ✕
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
            <img
              src={src}
              alt={alt}
              className="max-h-[90vh] max-w-full rounded-lg object-contain"
            />
            {caption && <p className="text-content mt-2 text-center text-sm">{caption}</p>}
          </div>
        </div>
      )}
    </>
  );
}
