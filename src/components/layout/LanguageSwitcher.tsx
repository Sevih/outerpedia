'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';
import { LANGUAGES, LANGS, DEFAULT_LANG, type Lang } from '@/lib/i18n/config';

/**
 * Sélecteur de langue. En dev (path-based) : lien vers `/{lang}{path}` (défaut =
 * racine). En prod, le proxy sous-domaine prend le relais ; ici on reste sur le
 * path-based, simple et suffisant pour le portage.
 */
export function LanguageSwitcher({ current }: { current: Lang }) {
  const pathname = usePathname();
  // Retire un éventuel préfixe de langue déjà présent dans le path.
  const stripped = pathname.replace(new RegExp(`^/(${LANGS.join('|')})(?=/|$)`), '') || '/';

  const hrefFor = (lang: Lang): Route =>
    (lang === DEFAULT_LANG ? stripped : `/${lang}${stripped === '/' ? '' : stripped}`) as Route;

  return (
    <div className="flex items-center gap-1">
      {LANGS.map((lang) => (
        <Link
          key={lang}
          href={hrefFor(lang)}
          className={
            lang === current
              ? 'text-accent text-xs font-semibold'
              : 'text-content-subtle hover:text-content text-xs'
          }
          title={LANGUAGES[lang].label}
        >
          {LANGUAGES[lang].abbrev}
        </Link>
      ))}
    </div>
  );
}
