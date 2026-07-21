'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Route } from 'next';
import { LANGUAGES, LANGS, DEFAULT_LANG, type Lang } from '@/lib/i18n/config';
import { img } from '@/lib/images';

/** Libellés du sélecteur (localisés côté serveur — pas de contexte i18n client). */
export interface LanguageSwitcherStrings {
  language: string;
  official: string;
  community: string;
  communityNote: string;
}

/**
 * Drapeau SVG en <img> (mêmes assets que la V2, servis par le pipeline
 * d'images) — les emojis drapeaux ne rendent pas sur Chrome/Windows.
 */
function FlagIcon({ code, className = 'h-3.5 w-5' }: { code: string; className?: string }) {
  return (
    <img
      src={img.flag(code)}
      alt=""
      aria-hidden
      width={20}
      height={14}
      className={`shrink-0 rounded-xs object-cover ${className}`}
    />
  );
}

type Variant = 'desktop' | 'mobile-chips';

/**
 * Sélecteur de langue (structure V2, tokens V3) : bouton drapeau + abréviation
 * ouvrant une liste avec badge officiel/communautaire et note de repli, ou
 * variante `mobile-chips` (rangée de puces, drawer mobile). La navigation reste
 * celle de la V3 (préfixe de path, pas de sous-domaine) et CONSERVE ?query et
 * #hash — l'état des guides vit dans l'URL (#version=/#team=…), connus
 * seulement au clic.
 */
export function LanguageSwitcher({
  current,
  strings,
  variant = 'desktop',
}: {
  current: Lang;
  strings: LanguageSwitcherStrings;
  variant?: Variant;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Fermeture au clic extérieur + Échap (comme la V2).
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Retire un éventuel préfixe de langue déjà présent dans le path.
  const stripped = pathname.replace(new RegExp(`^/(${LANGS.join('|')})(?=/|$)`), '') || '/';

  const navigate = (target: Lang) => {
    setOpen(false);
    if (target === current) return;
    const base =
      target === DEFAULT_LANG ? stripped : `/${target}${stripped === '/' ? '' : stripped}`;
    router.push((base + window.location.search + window.location.hash) as Route);
  };

  const cfg = LANGUAGES[current];

  // Variante drawer mobile : rangée de puces, pas de dropdown.
  if (variant === 'mobile-chips') {
    return (
      <div>
        <p className="text-content-subtle mb-2 font-mono text-[10px] tracking-widest uppercase">
          {strings.language}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {LANGS.map((l) => {
            const c = LANGUAGES[l];
            const isCurrent = l === current;
            return (
              <button
                key={l}
                onClick={() => navigate(l)}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${
                  isCurrent
                    ? 'border-accent/60 bg-accent/10 text-accent'
                    : 'border-line bg-surface-base text-content-muted hover:text-content'
                }`}
                aria-current={isCurrent ? 'true' : undefined}
              >
                <FlagIcon code={c.flag} className="h-3 w-4.5" />
                <span className="font-mono">{c.abbrev}</span>
                {!c.isOfficial && <span className="bg-warn size-1 rounded-full" aria-hidden />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={strings.language}
        className="border-line bg-surface-base/70 text-content-muted hover:bg-surface-base flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-xs transition"
      >
        <FlagIcon code={cfg.flag} className="h-3 w-4.5" />
        <span>{cfg.abbrev}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className={`text-content-subtle shrink-0 transition ${open ? 'rotate-180' : ''}`}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="border-line bg-surface-raised absolute top-[calc(100%+6px)] right-0 z-70 w-60 rounded-lg border p-1.5 shadow-2xl">
          <p className="text-content-subtle px-2.5 pt-1 pb-1 font-mono text-[10px] tracking-widest uppercase">
            {strings.language}
          </p>
          <ul role="listbox" className="flex flex-col">
            {LANGS.map((l) => {
              const c = LANGUAGES[l];
              const isCurrent = l === current;
              return (
                <li key={l}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isCurrent}
                    onClick={() => navigate(l)}
                    className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition ${
                      isCurrent
                        ? 'bg-surface-overlay text-content-strong'
                        : 'text-content hover:bg-surface-overlay/60'
                    }`}
                  >
                    <FlagIcon code={c.flag} />
                    <span className="flex-1">{c.label}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[9px] tracking-wider uppercase ${
                        c.isOfficial ? 'bg-success/10 text-success' : 'bg-warn/10 text-warn'
                      }`}
                    >
                      {c.isOfficial ? strings.official : strings.community}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="border-line text-content-subtle mt-1 border-t px-2.5 pt-2 pb-1 text-[11px] leading-snug">
            <span className="text-warn">●</span> {strings.communityNote}
          </p>
        </div>
      )}
    </div>
  );
}
