import type { Metadata } from 'next';
import { normalizeLang } from '@/lib/i18n/config';
import { getT } from '@/i18n';
import { createPageMetadata } from '@/lib/seo';
import { parseText } from '@/lib/parse-text';
import { img } from '@/lib/images';
import contributors from '@data/curated/contributors.json';

export const revalidate = 86400;

/** Un contributeur (curé) — `favoriteCharacter` porte des tags inline `{P/…}`. */
interface Contributor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  favoriteCharacter?: string;
  quote?: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);
  const t = await getT(lang);
  return createPageMetadata({
    lang,
    path: '/contributors',
    title: t('page.contributors.title'),
    description: t('contributors.description'),
  });
}

/**
 * Contributeurs du site (liste curée). Chaque carte : avatar, nom, rôle, perso
 * favori (tags inline `{P/…}` rendus par `parseText`) et citation. Page statique
 * i18n, revalidation 24 h.
 */
export default async function ContributorsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang = normalizeLang(raw);
  const t = await getT(lang);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6">
      {/* Les headings sont en `width: fit-content` (globals.css) : `text-center`
          seul ne centre rien, il faut centrer le BLOC (mx-auto). */}
      <h1 className="text-content-strong mx-auto mb-4 text-center text-3xl font-bold">
        {t('contributors.title')}
      </h1>
      <p className="text-content-muted mx-auto mb-8 max-w-2xl text-center">
        {t('contributors.description')}
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {(contributors as Contributor[]).map((c) => (
          <div key={c.id} className="border-line-subtle bg-surface-raised rounded-lg border p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- asset R2/staging */}
                <img
                  src={img.contributor(c.avatar)}
                  alt={c.name}
                  width={80}
                  height={80}
                  className="border-accent/30 size-20 rounded-full border-2 object-cover"
                />
                <div className="flex-1">
                  <h2 className="text-content-strong mb-1 text-xl font-semibold">{c.name}</h2>
                  <p className="text-accent mb-2 text-sm">{c.role}</p>
                  {c.favoriteCharacter && (
                    <p className="text-content-muted mb-2 text-sm">
                      <span className="text-content-subtle">
                        {t('contributors.favorite_character')}
                      </span>{' '}
                      {parseText(c.favoriteCharacter, { lang, t })}
                    </p>
                  )}
                </div>
              </div>

              {c.quote && (
                <p className="border-accent/50 text-content-muted border-l-2 pl-3 text-sm italic">
                  &ldquo;{c.quote}&rdquo;
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
