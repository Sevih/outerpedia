import Link from 'next/link';
import { getT } from '@/i18n';
import { getRequestLang } from '@/lib/i18n/server';
import { localePath } from '@/lib/navigation';

/**
 * 404 localisée, rendue DANS le layout `[lang]` (header/footer présents).
 * Sans ce fichier, chaque `notFound()` du site (slug de perso inconnu, vieux
 * vieux lien, outil non porté…) rendait la page par défaut de Next : anglais
 * seul, sans navigation, aucun chemin de retour.
 *
 * Une not-found ne reçoit PAS les params du segment (limite App Router) : la
 * langue vient du store à portée requête posé par le layout
 * (`setRequestLang`/`getRequestLang`) — repli langue par défaut si un rendu
 * arrivait hors de ce cadre.
 */
export default async function NotFound() {
  const lang = getRequestLang();
  const t = await getT(lang);

  const links = [
    { href: '/', label: t('nav.home') },
    { href: '/characters', label: t('nav.characters') },
    { href: '/tools', label: t('nav.utilities') },
    { href: '/guides', label: t('nav.guides') },
  ] as const;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center md:px-6">
      <p className="text-accent text-7xl font-bold">404</p>
      {/* Headings en `width: fit-content` (globals.css) : centrer le BLOC. */}
      <h1 className="text-content-strong mx-auto mt-4 text-3xl font-bold">{t('notFound.title')}</h1>
      <p className="text-content-muted mx-auto mt-3 max-w-md">{t('notFound.message')}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={localePath(lang, l.href)}
            className="border-line-subtle bg-surface-raised text-content-strong hover:bg-line rounded-md border px-4 py-2 text-sm transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
