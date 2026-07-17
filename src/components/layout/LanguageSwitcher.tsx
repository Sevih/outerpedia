'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';
import type { Route } from 'next';
import { LANGUAGES, LANGS, DEFAULT_LANG, type Lang } from '@/lib/i18n/config';

/**
 * Sélecteur de langue. En dev (path-based) : lien vers `/{lang}{path}` (défaut =
 * racine). En prod, le proxy sous-domaine prend le relais ; ici on reste sur le
 * path-based, simple et suffisant pour le portage.
 */
export function LanguageSwitcher({ current }: { current: Lang }) {
  const pathname = usePathname();
  const router = useRouter();
  // Retire un éventuel préfixe de langue déjà présent dans le path.
  const stripped = pathname.replace(new RegExp(`^/(${LANGS.join('|')})(?=/|$)`), '') || '/';

  const hrefFor = (lang: Lang): Route =>
    (lang === DEFAULT_LANG ? stripped : `/${lang}${stripped === '/' ? '' : stripped}`) as Route;

  // L'état de la page vit AUSSI dans l'URL (?query, et #hash pour l'état
  // interne des guides — #version=/#team=…) : changer de langue doit le
  // conserver. Or search/hash ne sont connus qu'au CLIC : le hash n'existe pas
  // côté serveur, et ses écritures `replaceState` n'émettent aucun événement
  // à s'abonner. D'où l'interception du clic SIMPLE seulement — clic
  // modifié/molette garde le href nu de Link (nouvel onglet sans état, assumé).
  const go = (e: MouseEvent<HTMLAnchorElement>, lang: Lang) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    router.push((hrefFor(lang) + window.location.search + window.location.hash) as Route);
  };

  return (
    <div className="flex items-center gap-1">
      {LANGS.map((lang) => (
        <Link
          key={lang}
          href={hrefFor(lang)}
          onClick={(e) => go(e, lang)}
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
