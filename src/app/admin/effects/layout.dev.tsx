import Link from 'next/link';
import type { Route } from 'next';
import { getMergedEffects } from '@/lib/data/effects';

export const dynamic = 'force-dynamic';

/** Master-detail : menu vertical des effets (ordre id) + contenu à droite. */
export default function AdminEffectsLayout({ children }: { children: React.ReactNode }) {
  const effects = getMergedEffects();

  return (
    <div className="flex gap-6">
      <aside className="border-line-subtle sticky top-6 flex h-[calc(100dvh-7.5rem)] w-64 shrink-0 flex-col self-start overflow-hidden rounded-lg border">
        <div className="bg-surface-overlay text-content-subtle flex items-baseline justify-between px-3 py-2 text-xs font-semibold uppercase">
          <Link href={'/admin/effects' as Route} className="hover:text-content">
            Effets
          </Link>
          <span>{effects.length}</span>
        </div>
        <ul className="divide-line-subtle min-h-0 flex-1 divide-y overflow-y-auto text-sm">
          {effects.map((e) => (
            <li key={e.id}>
              <Link
                href={`/admin/effects/${e.id}` as Route}
                className="hover:bg-surface-overlay/50 flex items-center gap-2 px-3 py-1.5"
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${e.isDebuff ? 'bg-danger' : 'bg-success'}`}
                />
                <span className="text-content min-w-0 flex-1 truncate">
                  {e.name.en || <span className="text-danger">(sans nom)</span>}
                </span>
                {e.hidden && <span className="text-content-subtle text-xs">✕</span>}
                {e.overridden && <span className="text-accent text-xs">✎</span>}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
