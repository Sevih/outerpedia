import Link from 'next/link';
import type { Route } from 'next';
import { assertDevOnly } from '@/lib/admin/guard';

// Outil local : jamais prérendu, 404 en prod.
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  assertDevOnly();
  return (
    <div className="bg-surface-base text-content min-h-screen">
      <header className="border-line-subtle bg-surface-raised border-b">
        <div className="flex items-center gap-4 px-6 py-3">
          <Link href={'/admin' as Route} className="text-content-strong font-semibold">
            Admin
          </Link>
          <span className="bg-warn/15 text-warn rounded px-2 py-0.5 text-xs font-medium">
            local · dev only
          </span>
          <Link
            href={'/admin/characters' as Route}
            className="text-content-muted hover:text-content-strong text-sm"
          >
            Personnages
          </Link>
          <Link
            href={'/admin/effects' as Route}
            className="text-content-muted hover:text-content-strong text-sm"
          >
            Effets
          </Link>
          <Link
            href={'/admin/gear-presets' as Route}
            className="text-content-muted hover:text-content-strong text-sm"
          >
            Presets gear
          </Link>
          <Link
            href={'/admin/equipment' as Route}
            className="text-content-muted hover:text-content-strong text-sm"
          >
            Équipement
          </Link>
          <Link
            href={'/admin/editorial' as Route}
            className="text-content-muted hover:text-content-strong text-sm"
          >
            Éditorial
          </Link>
          <Link
            href={'/admin/tags' as Route}
            className="text-content-muted hover:text-content-strong text-sm"
          >
            Tags
          </Link>
        </div>
      </header>
      <main className="px-6 py-6">{children}</main>
    </div>
  );
}
