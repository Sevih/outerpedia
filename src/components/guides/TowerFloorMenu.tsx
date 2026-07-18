'use client';

/**
 * LE SÉLECTEUR de la colonne de gauche d'une tour — deux formes, un composant :
 *   - tours standard : la liste PLATE des étages (numéro + boss) ;
 *   - very hard : les COMBATS groupés (Floor 20 / Demiurges / Random), boss +
 *     icône d'élément, comme le menu du jeu.
 *
 * Chaque entrée est un LIEN vers sa propre URL (sous-route statique) : le détail
 * est rendu côté serveur, ce composant ne fait que filtrer à la frappe et marquer
 * l'entrée courante. Les libellés (boss, sprites) sont calculés au build.
 */
import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { img } from '@/lib/images';

export interface TowerMenuEntry {
  /** Clé stable (n° d'étage ou id de boss) — compare à `currentKey`. */
  key: string;
  href: string;
  /** Texte principal (nom de boss). */
  label: string;
  /** Badge numérique à gauche (n° d'étage) — tours standard. */
  number?: number;
  /** Portrait du boss à gauche (face icon) — very hard. */
  portraitSrc?: string;
  /** Élément du boss (icône à droite). */
  element?: string;
  /** Classe du boss (icône à droite). */
  classType?: string;
  /** Pastille « a une restriction fixe » — tours standard. */
  flag?: boolean;
}

export interface TowerMenuSection {
  /** En-tête de groupe (very hard) ; absent = liste plate. */
  title?: string;
  entries: TowerMenuEntry[];
}

export function TowerFloorMenu({
  sections,
  currentKey,
  searchPlaceholder,
}: {
  sections: TowerMenuSection[];
  currentKey: string;
  searchPlaceholder: string;
}) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const match = (e: TowerMenuEntry) =>
    !q || e.label.toLowerCase().includes(q) || (e.number != null && String(e.number).includes(q));

  const visible = sections
    .map((s) => ({ ...s, entries: s.entries.filter(match) }))
    .filter((s) => s.entries.length > 0);

  return (
    <div className="md:sticky md:top-20">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
        className="border-line-subtle bg-surface-raised text-content-strong placeholder:text-content-muted focus:border-accent mb-3 w-full rounded-md border px-3 py-2 text-sm outline-none"
      />
      {/* Hauteur PLAFONNÉE : la liste défile en interne. `100vh-9rem` supposait
          le menu déjà collé en haut — avant scroll, l'en-tête de page le
          poussait bien sous le viewport. Un cap franc en vh reste correct dans
          les deux états. */}
      <div className="border-line-subtle bg-surface-raised max-h-[45vh] space-y-1 overflow-y-auto rounded-lg border p-1.5 md:max-h-[60vh]">
        {visible.map((section, si) => (
          <div key={si} className="space-y-0.5">
            {section.title && (
              <p className="text-content-muted px-2.5 pt-2 pb-1 text-xs font-semibold tracking-wide uppercase">
                {section.title}
              </p>
            )}
            {section.entries.map((e) => {
              const active = e.key === currentKey;
              return (
                <Link
                  key={e.key}
                  href={e.href as Route}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors',
                    active
                      ? 'bg-accent/15 text-content-strong font-medium'
                      : 'text-content hover:bg-surface-hover',
                  ].join(' ')}
                >
                  {/* Numéro ET portrait coexistent (tours standard) ; le very
                      hard n'a pas de numéro, les archives pas de portrait. */}
                  {e.number != null && (
                    <span className="text-content-muted w-6 shrink-0 text-right tabular-nums">
                      {e.number}
                    </span>
                  )}
                  {e.portraitSrc && (
                    // eslint-disable-next-line @next/next/no-img-element -- sprite R2/staging
                    <img
                      src={e.portraitSrc}
                      alt=""
                      className="border-line-subtle h-8 w-8 shrink-0 rounded-full border object-cover"
                      loading="lazy"
                    />
                  )}
                  <span className="min-w-0 flex-1 truncate">{e.label}</span>
                  {(e.element || e.classType) && (
                    <span className="flex shrink-0 items-center gap-1">
                      {e.classType && (
                        // eslint-disable-next-line @next/next/no-img-element -- sprite R2/staging
                        <img src={img.klass(e.classType)} alt="" className="h-4 w-4" />
                      )}
                      {e.element && (
                        // eslint-disable-next-line @next/next/no-img-element -- sprite R2/staging
                        <img src={img.element(e.element)} alt="" className="h-4 w-4" />
                      )}
                    </span>
                  )}
                  {e.flag && (
                    <span aria-hidden className="bg-accent/70 h-1.5 w-1.5 shrink-0 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
