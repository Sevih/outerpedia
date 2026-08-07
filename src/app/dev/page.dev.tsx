import Link from 'next/link';
import type { Route } from 'next';

/**
 * INDEX des pages de test de rendu (dev-only, route `/dev` — `.dev.tsx` non
 * buildé en prod). Point d'entrée du bouton « Dev » du header ; chaque outil
 * s'ajoute ici. Le layout `/dev` fournit le `<html>` (RootDocument).
 */
export const metadata = { title: 'Pages de test' };

const PAGES: { href: string; title: string; desc: string }[] = [
  {
    href: '/dev/tokens',
    title: 'Tokens de couleur',
    desc: 'Chaque token de thème montré appliqué dans une maquette du composant qui l’emploie.',
  },
  {
    href: '/dev/parse-text',
    title: 'Parse-text (tags inline)',
    desc: 'Tous les tags éditoriaux `{B/…}` `{SK/…}` `{I-W/…}`… rendus par le vrai moteur, avec leur infobulle.',
  },
  {
    href: '/dev/thumbnail',
    title: 'Vignette du jeu',
    desc: 'La vignette transcrite des prefabs `uimonsterthumbnail` et `uicharacterthumbnail` : ce que les deux habillages partagent, et les huit calques où ils divergent.',
  },
];

export default function DevIndex() {
  return (
    <div className="bg-surface-base text-content min-h-screen p-6">
      <header className="mb-6">
        <h1 className="text-content-strong text-2xl font-bold">Pages de test (dev)</h1>
        <p className="text-content-muted mt-1 text-sm">
          Rendus de contrôle non buildés en prod (routes <code>.dev.tsx</code>).
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {PAGES.map((p) => (
          <Link
            key={p.href}
            href={p.href as Route}
            className="border-line-subtle bg-surface-raised hover:border-line hover:bg-surface-overlay group rounded-xl border p-4 transition"
          >
            <div className="text-content-strong group-hover:text-accent flex items-center gap-2 font-semibold transition">
              {p.title}
              <span className="text-content-subtle font-mono text-xs">{p.href}</span>
            </div>
            <p className="text-content-muted mt-1 text-sm">{p.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
