'use client';

import { useRef, useLayoutEffect } from 'react';

/**
 * Rétrécit le texte pour tenir sur UNE ligne (portage V2) : rendu à `max` px
 * puis compression visuelle par transform (évite les artefacts de hinting aux
 * petites tailles). `min` borne l'échelle.
 */
export function FitText({
  children,
  max,
  min,
  center,
  className,
}: {
  children: string;
  max: number;
  min: number;
  center?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = '';
    el.style.fontSize = `${max}px`;
    if (el.scrollWidth <= el.clientWidth) return;
    const minScale = min / max;
    const scale = Math.max(minScale, el.clientWidth / el.scrollWidth);
    el.style.transform = `scaleX(${scale})`;
  }, [children, max, min]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ fontSize: max, whiteSpace: 'nowrap', transformOrigin: center ? 'center' : 'left' }}
    >
      {children}
    </div>
  );
}
