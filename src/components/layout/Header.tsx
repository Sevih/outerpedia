import Link from 'next/link';
import type { Route } from 'next';
import { getRequestLang } from '@/lib/i18n/server';
import { getT } from '@/i18n';
import { localePath } from '@/lib/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';

/** En-tête global (portage minimal : logo + nav + langue). */
export async function Header() {
  const lang = getRequestLang();
  const t = await getT(lang);

  const nav: Array<{ href: Route; label: string }> = [
    { href: localePath(lang, '/characters'), label: t('nav.characters') },
    { href: localePath(lang, '/equipment'), label: t('nav.equipment') },
  ];

  return (
    <header className="border-line-subtle bg-surface-raised sticky top-0 z-40 border-b">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
        <Link href={localePath(lang, '/')} className="text-content-strong font-semibold">
          Outerpedia
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-content-muted hover:text-content-strong"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <LanguageSwitcher current={lang} />
        </div>
      </div>
    </header>
  );
}
