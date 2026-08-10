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
  noResults: string;
  clearFilter: string;
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
 * FORME RESPONSIVE, un seul DOM : bottom sheet plein écran sous `sm` (poignée,
 * coins hauts arrondis, collé au bas — le champ de filtre reste au-DESSUS du
 * clavier virtuel), modale centrée à partir de `sm`. La bascule est purement
 * CSS, aucun état de forme. Maquette : projet Claude Design « Settings Modal ».
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
      className="fixed inset-0 z-9999 flex items-end justify-center sm:items-start sm:px-4 sm:pt-[8vh] sm:pb-4"
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

      {/* Panneau : sheet en bas de l'écran sous `sm`, modale centrée au-delà. */}
      <div className="border-line bg-surface-raised relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border shadow-2xl sm:max-h-full sm:max-w-2xl sm:rounded-xl">
        {/* Poignée du sheet (mobile seulement). */}
        <div className="flex justify-center pt-2 sm:hidden" aria-hidden>
          <span className="bg-line h-1 w-9 rounded-full" />
        </div>

        <div className="border-line-subtle flex items-center gap-1 border-b py-2 pr-2 pl-4 sm:py-1.5">
          {edited && (
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label={strings.back}
              className="text-content-subtle hover:text-content-strong focus-visible:ring-ring -ml-3 flex size-11 shrink-0 items-center justify-center rounded-lg transition outline-none focus-visible:ring-2 sm:size-9"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
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
          <div className="min-w-0 flex-1 py-1.5">
            <h2 className="text-content-strong truncate text-sm font-semibold">
              {edited ? edited.name : strings.title}
            </h2>
            {/* Fil d'Ariane du niveau 2 : le nom du perso est le titre, la
                section d'origine reste lisible en dessous. */}
            {edited && <div className="text-content-subtle text-[11px]">{strings.skins}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={strings.close}
            className="text-content-subtle hover:text-content-strong focus-visible:ring-ring flex size-11 shrink-0 items-center justify-center rounded-lg transition outline-none focus-visible:ring-2 sm:size-9"
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
          <div className="overflow-y-auto px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3">
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
                    className={`focus-visible:ring-ring group flex flex-col items-center gap-1.5 rounded-xl border p-2 transition outline-none focus-visible:ring-2 ${
                      isCurrent
                        ? 'border-accent bg-accent/10'
                        : 'border-line-subtle hover:border-line hover:bg-surface-overlay'
                    }`}
                  >
                    <span className="relative w-full">
                      <img
                        src={img.portrait(opt.model ?? edited.id)}
                        alt={opt.name}
                        loading="lazy"
                        className="aspect-180/344 w-full rounded object-cover"
                      />
                      {/* Marquage « tenue actuelle » : pastille ✓, en plus du
                          bord accent — lisible même l'œil sur l'image. */}
                      {isCurrent && (
                        <span
                          aria-hidden
                          className="bg-accent text-accent-fg absolute top-1.5 right-1.5 flex size-[18px] items-center justify-center rounded-full text-[10px] font-bold"
                        >
                          ✓
                        </span>
                      )}
                    </span>
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
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {/* Portrait animé — une CARTE-contrôle, pas un titre de section :
                même famille de surfaces que le picker, le switch à droite. */}
            <div className="border-line-subtle bg-surface-overlay/50 flex items-center gap-4 rounded-xl border px-3.5 py-3">
              <div className="min-w-0 flex-1">
                <div className="text-content-strong text-sm font-medium">{strings.animated}</div>
                <p className="text-content-subtle mt-0.5 text-xs">{strings.animatedNote}</p>
              </div>
              {/* Le padding (compensé par la marge) porte la cible tactile à 44px. */}
              <button
                type="button"
                role="switch"
                aria-checked={settings.animatedPortraits}
                aria-label={strings.animated}
                onClick={() => setAnimatedPortraits(!settings.animatedPortraits)}
                className="focus-visible:ring-ring -m-2 shrink-0 rounded-full p-2 outline-none focus-visible:ring-2"
              >
                <span
                  className={`relative block h-7 w-12 rounded-full transition-colors ${
                    settings.animatedPortraits
                      ? 'bg-accent'
                      : 'bg-surface-overlay border-line border'
                  }`}
                >
                  <span
                    className={`bg-content-strong absolute top-0.5 left-0.5 size-6 rounded-full shadow transition-transform ${
                      settings.animatedPortraits ? 'translate-x-5' : ''
                    }`}
                  />
                </span>
              </button>
            </div>

            {/* Skins par perso */}
            <div className="flex min-h-0 flex-col">
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-content-strong text-sm font-medium">{strings.skins}</div>
                {overrides > 0 && (
                  <button
                    type="button"
                    onClick={clearAllSkins}
                    className="border-line text-content-subtle hover:border-line-strong hover:text-content-strong focus-visible:ring-ring flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition outline-none focus-visible:ring-2"
                  >
                    {strings.resetSkins}
                    <span className="bg-surface-overlay text-content rounded-full px-1.5 text-[10px] leading-4">
                      {overrides}
                    </span>
                  </button>
                )}
              </div>
              <p className="text-content-subtle mt-0.5 mb-2 text-xs">{strings.skinsNote}</p>
              {/* Sticky dans la zone scrollée : le filtre reste sous la main
                  (et au-dessus du clavier virtuel, le sheet étant collé au bas). */}
              <div className="bg-surface-raised sticky top-0 z-10 pb-2">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={strings.filterPlaceholder}
                  className="border-line bg-surface-base text-content placeholder:text-content-subtle focus-visible:border-ring w-full rounded-md border px-3 py-2.5 text-sm outline-none sm:py-1.5"
                />
              </div>
              {rows.length === 0 ? (
                /* Filtre sans résultat — le catalogue, lui, n'est jamais vide. */
                <div className="flex flex-col items-center gap-2 px-4 py-8">
                  <p className="text-content-muted text-sm">{strings.noResults}</p>
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="text-accent text-sm underline"
                  >
                    {strings.clearFilter}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-1 sm:grid-cols-5 md:grid-cols-6">
                  {rows.map((c) => {
                    const chosen = settings.skins[c.id];
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setEditing(c.id)}
                        className="hover:bg-surface-overlay focus-visible:ring-ring flex flex-col items-center gap-1 rounded-lg p-1.5 transition outline-none focus-visible:ring-2"
                      >
                        {/* La face suit le choix ; le perso skinné porte un
                            anneau accent + pastille ✓ sur la face SEULE (pas
                            de lavis pleine tuile : à 60 tuiles, ça surcharge). */}
                        <span className="relative">
                          <img
                            src={img.face(chosen ?? c.id)}
                            alt=""
                            width={48}
                            height={48}
                            loading="lazy"
                            className="size-12 rounded"
                          />
                          {chosen && (
                            <>
                              <span
                                aria-hidden
                                className="border-accent absolute -inset-[3px] rounded-[10px] border-2"
                              />
                              <span
                                aria-hidden
                                className="bg-accent text-accent-fg ring-surface-raised absolute -right-1.5 -bottom-1.5 flex size-4 items-center justify-center rounded-full text-[9px] font-bold ring-2"
                              >
                                ✓
                              </span>
                            </>
                          )}
                        </span>
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
              )}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
