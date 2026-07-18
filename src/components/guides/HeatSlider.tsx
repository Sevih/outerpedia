'use client';

import { useCallback, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';

/**
 * GLISSIÈRE DE CHALEUR — le châssis commun aux sélecteurs d'échelle longue :
 * la glissière de PALIER (`RankSlider`, BossStats) et la glissière de STAGE
 * (`EncounterSlider`, EncounterSelection). Piste en dégradé de chaleur, pouce
 * glissable, clic n'importe où, clavier (←/→ un cran, Page↑/↓ trois, Début/Fin),
 * pas-à-pas ◀ ▶.
 *
 * DEUX éléments, deux rôles (le cœur du geste tactile) :
 *  - `hit` ÉCOUTE : toute la zone (rail + débords du pouce + repères). Le pouce
 *    déborde du rail à chaque extrémité ; si le rail écoutait lui-même, ces
 *    débords tomberaient hors de la zone sensible. `padClass` réserve leur place.
 *  - `rail` MESURE : la géométrie 0 % → 100 % se lit sur lui SEUL, sinon le
 *    rembourrage de la zone d'écoute décalerait tous les crans.
 *
 * Ce qui DIFFÈRE d'une glissière à l'autre — graduations (`marks`), contenu du
 * pouce (`thumb`), libellés du bas (`labels`), et les dimensions
 * (`railClass`/`padClass`/`thumbClass`) — est fourni par l'appelant, qui calcule
 * ses positions à partir du même `count`.
 */
export function HeatSlider({
  count,
  selected,
  onSelect,
  ariaLabel,
  valueText,
  prevLabel,
  nextLabel,
  railClass = 'h-11',
  padClass = 'px-5',
  thumbClass = 'h-9.5 w-9.5 rounded-[10px]',
  marks,
  thumb,
  labels,
}: {
  count: number;
  selected: number;
  onSelect: (index: number) => void;
  /** Nom du curseur (aria + lecteurs d'écran). */
  ariaLabel: string;
  /** `aria-valuetext` : la désignation complète du cran courant. */
  valueText: string;
  prevLabel: string;
  nextLabel: string;
  /** Hauteur du rail (`h-11` palier, `h-8` stage). */
  railClass?: string;
  /** Rembourrage horizontal de la zone d'écoute (réserve les débords du pouce). */
  padClass?: string;
  /** Taille + arrondi du pouce. */
  thumbClass?: string;
  /** Graduations posées sur le rail (positions calculées par l'appelant). */
  marks?: ReactNode;
  /** Contenu du pouce (badge de grade, numéro de stage…). */
  thumb: ReactNode;
  /** Libellés sous le rail (noms de grade, numéros de cran…). */
  labels?: ReactNode;
}) {
  const last = count - 1;
  const hit = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const pos = last > 0 ? selected / last : 0;

  const clamp = useCallback((i: number) => Math.min(last, Math.max(0, i)), [last]);

  /** Cran le plus proche du pointeur — mesuré sur le RAIL, pas sur la zone d'écoute. */
  const indexAt = useCallback(
    (clientX: number) => {
      const box = rail.current?.getBoundingClientRect();
      if (!box || box.width === 0) return selected;
      const ratio = Math.min(1, Math.max(0, (clientX - box.left) / box.width));
      return Math.round(ratio * last);
    },
    [last, selected],
  );

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    // La capture garde le glissé vivant même quand le doigt sort de la zone.
    hit.current?.setPointerCapture(e.pointerId);
    dragging.current = true;
    onSelect(indexAt(e.clientX));
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging.current) onSelect(indexAt(e.clientX));
  };
  const onUp = () => {
    dragging.current = false;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const jump: Record<string, number> = {
      ArrowRight: 1,
      ArrowUp: 1,
      ArrowLeft: -1,
      ArrowDown: -1,
      PageUp: 3,
      PageDown: -3,
    };
    let next: number;
    if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    else if (e.key in jump) next = clamp(selected + jump[e.key]!);
    else return;
    e.preventDefault();
    onSelect(next);
  };

  /** ◀ / ▶ : un cran vers le bas ou vers le haut de l'échelle. */
  const step = (delta: 1 | -1, aria: string, glyph: string) => (
    <button
      type="button"
      aria-label={aria}
      disabled={delta < 0 ? selected === 0 : selected === last}
      onClick={() => onSelect(clamp(selected + delta))}
      className="border-line bg-surface-base text-content hover:text-content-strong enabled:hover:border-line-strong flex h-7 w-6 shrink-0 items-center justify-center rounded border text-[10px] transition-colors disabled:opacity-30"
    >
      {glyph}
    </button>
  );

  return (
    <div className="flex items-center gap-2">
      {step(-1, prevLabel, '◀')}

      <div
        ref={hit}
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={last}
        aria-valuenow={selected}
        aria-valuetext={valueText}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onLostPointerCapture={onUp}
        onKeyDown={onKeyDown}
        className={`focus-visible:ring-ring min-w-0 flex-1 cursor-pointer touch-none rounded ${padClass} py-0.5 select-none focus-visible:ring-2 focus-visible:outline-none`}
      >
        <div ref={rail} className={`relative ${railClass}`}>
          <span
            aria-hidden
            className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full"
            style={{
              background:
                'linear-gradient(90deg, var(--rank-heat-lo), var(--rank-heat-mid), var(--rank-heat-hi))',
            }}
          />

          {marks}

          <span
            aria-hidden
            className={`border-accent bg-surface-base ring-accent/20 pointer-events-none absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border-2 shadow-lg ring-4 transition-[left] duration-75 ${thumbClass}`}
            style={{ left: `${pos * 100}%` }}
          >
            {thumb}
          </span>
        </div>

        {labels != null && (
          <div aria-hidden className="relative h-4">
            {labels}
          </div>
        )}
      </div>

      {step(1, nextLabel, '▶')}
    </div>
  );
}
