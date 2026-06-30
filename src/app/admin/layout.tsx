import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { assertDevOnly } from '@/lib/admin/guard';

// Outil local : jamais prérendu, 404 en prod.
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  assertDevOnly();
  return (
    <div className="bg-surface-base text-content min-h-screen">
      <header className="border-line-subtle bg-surface-raised border-b">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-3">
          <Link href="/admin" className="text-content-strong font-semibold">
            Admin
          </Link>
          <span className="bg-warn/15 text-warn rounded px-2 py-0.5 text-xs font-medium">
            local · dev only
          </span>
          <Link
            href="/admin/characters"
            className="text-content-muted hover:text-content-strong text-sm"
          >
            Personnages
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-6">{children}</main>
    </div>
  );
}
