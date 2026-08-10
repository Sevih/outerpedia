'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { img } from '@/lib/images';
import { clearAllSkins, setAnimatedPortraits, setSkin, useSiteSettings } from '@/lib/site-settings';

export interface SettingsStrings {
  title: string;
  animated: string;
  animatedNote: string;
  skins: string;
  skinsNote: string;
  defaultPortrait: string;
  resetSkins: string;
  filterPlaceholder: string;
  close: string;
  back: string;
}

/** Un perso à skins, prêt pour la modale — localisé côté serveur par `Header`. */
export interface SkinCatalogEntry {
  id: string;
  /** Nom d'affichage complet (titre compris), déjà dans la langue. */
  name: string;
  /** Les costumes AFFICHABLES (vignette vérifiée à l'extraction), triés. */
  options: { model: string; name: string }[];
}

/** Minuscule + sans diacritiques — même règle que la palette de recherche. */
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

/**
 * RÉGLAGES DU SITE — la modale du header. Deux réglages, un seul store
 * (`site-settings`) : le portrait animé (WebGL, opt-in) et le skin affiché par
 * personnage. Le catalogue des skins arrive PRÉ-LOCALISÉ du serveur (~60 persos,
 * quelques Ko) : la modale n'importe aucune table, elle rend ce qu'on lui donne.
 *
 * Le choix de skin est un PICKER à deux niveaux : la grille des persos
 * éligibles (leur face suit déjà le choix), puis les tenues du perso choisi en
 * VIGNETTES de portrait — on choisit une image en regardant des images, pas un
 * nom dans un `<select>`.
 *
 * RENDUE EN PORTAL vers `document.body` — pas un raffinement : le header porte
 * `backdrop-blur`, et `backdrop-filter` fait de lui le bloc conteneur des
 * descendants `fixed` (spec Filter Effects). Rendu dans le header, le voile
 * « plein écran » se retrouvait confiné à sa bande de 56 px : cliquer en dehors
 * ne touchait jamais le voile, la modale ne se fermait pas (vécu).
 */
export function SettingsModal({
  catalog,
  strings,
  onClose,
}: {
  catalog: SkinCatalogEntry[];
  strings: SettingsStrings;
  onClose: () => void;
}) {
  const settings = useSiteSettings();
  const [query, setQuery] = useState('');
  /** Perso en cours d'édition (niveau 2 du picker), ou null (la grille). */
  const [editing, setEditing] = useState<string | null>(null);

  // Verrou du scroll de fond + fermeture à Échap (Échap remonte d'un niveau).
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setEditing((cur) => {
        if (cur === null) onClose();
        return null;
      });
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const rows = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return catalog;
    const toks = q.split(/\s+/);
    return catalog.filter((c) => {
      const n = norm(c.name);
      return toks.every((tk) => n.includes(tk));
    });
  }, [catalog, query]);

  const overrides = Object.keys(settings.skins).length;
  const edited = editing ? catalog.find((c) => c.id === editing) : undefined;

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-start justify-center px-4 pt-[8vh] pb-4"
      role="dialog"
      aria-modal="true"
      aria-label={strings.title}
    >
      {/* Voile — le clic en dehors ferme. */}
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        className="bg-surface-sunken/70 absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <div className="border-line bg-surface-raised relative z-10 flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-xl border shadow-2xl">
        <div className="border-line-subtle flex items-center gap-2 border-b px-4 py-3">
          {edited && (
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label={strings.back}
              className="text-content-subtle hover:text-content-strong -ml-1 rounded p-1 transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M15 6l-6 6 6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          <h2 className="text-content-strong min-w-0 flex-1 truncate text-sm font-semibold">
            {edited ? edited.name : strings.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={strings.close}
            className="text-content-subtle hover:text-content-strong rounded p-1 transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {edited ? (
          /* ---- Niveau 2 : les tenues du perso, en vignettes de portrait ---- */
          <div className="overflow-y-auto px-4 py-4">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {[
                { model: null as string | null, name: strings.defaultPortrait },
                ...edited.options,
              ].map((opt) => {
                const isCurrent = (settings.skins[edited.id] ?? null) === opt.model;
                return (
                  <button
                    key={opt.model ?? 'default'}
                    type="button"
                    onClick={() => setSkin(edited.id, opt.model)}
                    aria-pressed={isCurrent}
                    className={`group flex flex-col items-center gap-1.5 rounded-lg border p-2 transition ${
                      isCurrent
                        ? 'border-accent bg-accent/10'
                        : 'border-line-subtle hover:border-line hover:bg-surface-overlay'
                    }`}
                  >
                    <img
                      src={img.portrait(opt.model ?? edited.id)}
                      alt={opt.name}
                      loading="lazy"
                      className="aspect-180/344 w-full rounded object-cover"
                    />
                    <span
                      className={`line-clamp-2 min-h-[2.5em] w-full text-center text-xs leading-tight ${
                        isCurrent ? 'text-content-strong font-semibold' : 'text-content-muted'
                      }`}
                    >
                      {opt.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* ---- Niveau 1 : réglages + grille des persos éligibles ---- */
          <div className="flex flex-col gap-4 overflow-y-auto px-4 py-4">
            {/* Portrait animé */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-content-strong text-sm font-medium">{strings.animated}</div>
                <p className="text-content-subtle mt-0.5 text-xs">{strings.animatedNote}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.animatedPortraits}
                aria-label={strings.animated}
                onClick={() => setAnimatedPortraits(!settings.animatedPortraits)}
                className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
                  settings.animatedPortraits ? 'bg-accent' : 'bg-surface-overlay border-line border'
                }`}
              >
                <span
                  className={`bg-content-strong absolute top-0.5 left-0.5 size-5 rounded-full shadow transition-transform ${
                    settings.animatedPortraits ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>

            {/* Skins par perso */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-content-strong text-sm font-medium">{strings.skins}</div>
                {overrides > 0 && (
                  <button
                    type="button"
                    onClick={clearAllSkins}
                    className="text-content-subtle hover:text-content-strong text-xs underline transition"
                  >
                    {strings.resetSkins}
                  </button>
                )}
              </div>
              <p className="text-content-subtle mt-0.5 mb-2 text-xs">{strings.skinsNote}</p>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={strings.filterPlaceholder}
                className="border-line bg-surface-base text-content placeholder:text-content-subtle mb-3 w-full rounded-md border px-2.5 py-1.5 text-sm outline-none"
              />
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
                {rows.map((c) => {
                  const chosen = settings.skins[c.id];
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setEditing(c.id)}
                      className={`flex flex-col items-center gap-1 rounded-lg border p-1.5 transition ${
                        chosen
                          ? 'border-accent/60 bg-accent/5'
                          : 'hover:bg-surface-overlay border-transparent'
                      }`}
                    >
                      {/* La face suit le choix : un perso skinné se voit d'un
                          coup d'œil dans la grille. */}
                      <img
                        src={img.face(chosen ?? c.id)}
                        alt=""
                        width={48}
                        height={48}
                        loading="lazy"
                        className="size-12 rounded"
                      />
                      <span
                        className="text-content-muted line-clamp-2 min-h-[2.5em] w-full text-center text-[10px] leading-tight"
                        title={c.name}
                      >
                        {c.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
