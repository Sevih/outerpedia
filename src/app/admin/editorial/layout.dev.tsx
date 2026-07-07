import Link from 'next/link';
import type { Route } from 'next';
import { characterDisplayName, getCharacterListItems } from '@/lib/data/characters';
import { loadCuratedCharacters } from '@/lib/data/curated';

export const dynamic = 'force-dynamic';

/**
 * ÉDITORIAL (pros/cons + synergies) — séparé de l'extraction des persos
 * (/admin/characters) : ici on écrit du contenu humain. Master-detail : liste
 * des persos (marqueurs P = pros/cons, S = synergies) + éditeur à droite.
 */
export default function AdminEditorialLayout({ children }: { children: React.ReactNode }) {
  const curated = loadCuratedCharacters();
  const rows = getCharacterListItems()
    .map((c) => ({
      id: c.id,
      name: characterDisplayName(c),
      hasProsCons: Boolean(
        curated[c.id]?.prosCons?.pros?.length || curated[c.id]?.prosCons?.cons?.length,
      ),
      hasSynergies: Boolean(curated[c.id]?.synergies?.length),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const done = rows.filter((r) => r.hasProsCons).length;

  return (
    <div className="flex gap-6">
      <aside className="border-line-subtle sticky top-6 flex h-[calc(100dvh-7.5rem)] w-64 shrink-0 flex-col self-start overflow-hidden rounded-lg border">
        <div className="bg-surface-overlay text-content-subtle flex items-baseline justify-between px-3 py-2 text-xs font-semibold uppercase">
          <Link href={'/admin/editorial' as Route} className="hover:text-content">
            Éditorial
          </Link>
          <span>
            {done}/{rows.length}
          </span>
        </div>
        <ul className="divide-line-subtle min-h-0 flex-1 divide-y overflow-y-auto text-sm">
          {rows.map((r) => (
            <li key={r.id}>
              <Link
                href={`/admin/editorial/${r.id}` as Route}
                className="hover:bg-surface-overlay flex items-center justify-between gap-2 px-3 py-1.5"
              >
                <span className="text-content truncate">{r.name}</span>
                <span className="text-xs">
                  <span className={r.hasProsCons ? 'text-success' : 'text-content-subtle'}>P</span>{' '}
                  <span className={r.hasSynergies ? 'text-success' : 'text-content-subtle'}>S</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
