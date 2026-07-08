import Link from 'next/link';
import type { Route } from 'next';

export interface ToolRow {
  id: string;
  name: string;
  /** Le perso a-t-il déjà du contenu pour ce tool ? (marqueur vert) */
  done: boolean;
}

/**
 * Liste latérale de persos pour un Tool transverse (pros/cons, synergies…).
 * Le tool centre l'édition sur un perso choisi ; le marqueur signale la
 * couverture.
 */
export function ToolCharacterList({
  title,
  basePath,
  rows,
  marker,
}: {
  title: string;
  basePath: string;
  rows: ToolRow[];
  marker: string;
}) {
  const done = rows.filter((r) => r.done).length;

  return (
    <aside className="border-line-subtle sticky top-6 flex h-[calc(100dvh-7.5rem)] w-64 shrink-0 flex-col self-start overflow-hidden rounded-lg border">
      <div className="bg-surface-overlay text-content-subtle flex items-baseline justify-between px-3 py-2 text-xs font-semibold uppercase">
        <Link href={basePath as Route} className="hover:text-content">
          {title}
        </Link>
        <span>
          {done}/{rows.length}
        </span>
      </div>
      <ul className="divide-line-subtle min-h-0 flex-1 divide-y overflow-y-auto text-sm">
        {rows.map((r) => (
          <li key={r.id}>
            <Link
              href={`${basePath}/${r.id}` as Route}
              className="hover:bg-surface-overlay flex items-center justify-between gap-2 px-3 py-1.5"
            >
              <span className="text-content truncate">{r.name}</span>
              <span className={`text-xs ${r.done ? 'text-success' : 'text-content-subtle'}`}>
                {marker}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
